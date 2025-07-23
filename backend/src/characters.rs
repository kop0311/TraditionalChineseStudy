use warp::{Filter, Reply};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use redis::AsyncCommands;
use serde_json;
use std::time::Duration;

use crate::models::{HanziCharacter, CharacterQuery, PaginatedResponse, ErrorResponse};
use crate::schema::hanzi;
use crate::redis_client::RedisClient;

type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn character_routes(
    db_pool: DbPool,
    redis_client: RedisClient,
) -> impl Filter<Extract = impl Reply, Error = warp::Rejection> + Clone {
    let get_characters = warp::path("characters")
        .and(warp::get())
        .and(warp::query::<CharacterQuery>())
        .and(with_db(db_pool.clone()))
        .and(with_redis(redis_client.clone()))
        .and_then(get_characters_handler);

    let get_character_by_id = warp::path("characters")
        .and(warp::path::param::<i32>())
        .and(warp::get())
        .and(with_db(db_pool))
        .and(with_redis(redis_client))
        .and_then(get_character_by_id_handler);

    get_characters.or(get_character_by_id)
}

fn with_db(db_pool: DbPool) -> impl Filter<Extract = (DbPool,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db_pool.clone())
}

fn with_redis(redis_client: RedisClient) -> impl Filter<Extract = (RedisClient,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || redis_client.clone())
}

async fn get_characters_handler(
    query: CharacterQuery,
    db_pool: DbPool,
    redis_client: RedisClient,
) -> Result<impl Reply, warp::Rejection> {
    let page = query.pagination.page.unwrap_or(1);
    let limit = query.pagination.limit.unwrap_or(20);
    let offset = (page - 1) * limit;

    // Create cache key based on query parameters
    let cache_key = format!(
        "characters:level:{:?}:stroke:{:?}:search:{:?}:page:{}:limit:{}",
        query.level, query.stroke_count, query.search, page, limit
    );

    // Try to get from Redis cache first
    let mut redis_conn = match redis_client.get_async_connection().await {
        Ok(conn) => conn,
        Err(_) => {
            // If Redis is unavailable, proceed without cache
            return get_characters_from_db(query, db_pool, offset, limit).await;
        }
    };

    // Check cache
    let cached_result: Result<String, redis::RedisError> = redis_conn.get(&cache_key).await;
    
    if let Ok(cached_data) = cached_result {
        if let Ok(characters) = serde_json::from_str::<PaginatedResponse<HanziCharacter>>(&cached_data) {
            return Ok(warp::reply::with_status(
                warp::reply::json(&characters),
                warp::http::StatusCode::OK,
            ));
        }
    }

    // Cache miss - get from database
    let result = get_characters_from_db(query, db_pool, offset, limit).await;
    
    // Cache the result if successful
    if let Ok(reply) = &result {
        if let Ok(json_str) = serde_json::to_string(&reply) {
            let _: Result<(), redis::RedisError> = redis_conn
                .set_ex(&cache_key, json_str, 3600) // 1 hour TTL
                .await;
        }
    }

    result
}

async fn get_characters_from_db(
    query: CharacterQuery,
    db_pool: DbPool,
    offset: i64,
    limit: i64,
) -> Result<impl Reply, warp::Rejection> {
    let mut conn = match db_pool.get() {
        Ok(conn) => conn,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Database Error".to_string(),
                    message: "Failed to get database connection".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    // Build query with filters
    let mut db_query = hanzi::table.into_boxed();

    if let Some(level) = query.level {
        db_query = db_query.filter(hanzi::level.ge(level));
    }

    if let Some(stroke_count) = query.stroke_count {
        db_query = db_query.filter(hanzi::stroke_count.eq(stroke_count));
    }

    if let Some(search) = &query.search {
        db_query = db_query.filter(
            hanzi::character.like(format!("%{}%", search))
                .or(hanzi::pinyin.like(format!("%{}%", search)))
                .or(hanzi::meaning.like(format!("%{}%", search)))
        );
    }

    // Get total count for pagination
    let total = match db_query.clone().count().get_result::<i64>(&mut conn) {
        Ok(count) => count,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Database Error".to_string(),
                    message: "Failed to count characters".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    // Get paginated results with optimized query
    let characters = match db_query
        .order(hanzi::id.asc())
        .limit(limit)
        .offset(offset)
        .load::<HanziCharacter>(&mut conn)
    {
        Ok(chars) => chars,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Database Error".to_string(),
                    message: "Failed to fetch characters".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    let total_pages = (total + limit - 1) / limit;
    let page = (offset / limit) + 1;

    let response = PaginatedResponse {
        data: characters,
        page,
        limit,
        total,
        total_pages,
    };

    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        warp::http::StatusCode::OK,
    ))
}

async fn get_character_by_id_handler(
    id: i32,
    db_pool: DbPool,
    redis_client: RedisClient,
) -> Result<impl Reply, warp::Rejection> {
    let cache_key = format!("character:{}", id);

    // Try Redis cache first
    let mut redis_conn = match redis_client.get_async_connection().await {
        Ok(conn) => conn,
        Err(_) => {
            // If Redis is unavailable, proceed without cache
            return get_character_from_db(id, db_pool).await;
        }
    };

    // Check cache
    let cached_result: Result<String, redis::RedisError> = redis_conn.get(&cache_key).await;
    
    if let Ok(cached_data) = cached_result {
        if let Ok(character) = serde_json::from_str::<HanziCharacter>(&cached_data) {
            return Ok(warp::reply::with_status(
                warp::reply::json(&character),
                warp::http::StatusCode::OK,
            ));
        }
    }

    // Cache miss - get from database
    let result = get_character_from_db(id, db_pool).await;
    
    // Cache the result if successful
    if let Ok(reply) = &result {
        if let Ok(json_str) = serde_json::to_string(&reply) {
            let _: Result<(), redis::RedisError> = redis_conn
                .set_ex(&cache_key, json_str, 3600) // 1 hour TTL
                .await;
        }
    }

    result
}

async fn get_character_from_db(
    id: i32,
    db_pool: DbPool,
) -> Result<impl Reply, warp::Rejection> {
    let mut conn = match db_pool.get() {
        Ok(conn) => conn,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Database Error".to_string(),
                    message: "Failed to get database connection".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    match hanzi::table.find(id).first::<HanziCharacter>(&mut conn) {
        Ok(character) => Ok(warp::reply::with_status(
            warp::reply::json(&character),
            warp::http::StatusCode::OK,
        )),
        Err(diesel::NotFound) => Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Not Found".to_string(),
                message: "Character not found".to_string(),
                code: 404,
            }),
            warp::http::StatusCode::NOT_FOUND,
        )),
        Err(_) => Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Database Error".to_string(),
                message: "Failed to fetch character".to_string(),
                code: 500,
            }),
            warp::http::StatusCode::INTERNAL_SERVER_ERROR,
        )),
    }
}
