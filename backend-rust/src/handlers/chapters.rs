use warp::{Filter, Reply, Rejection, reply::json};
use uuid::Uuid;
use crate::handlers::AppState;
use crate::models::chapter::{Chapter, CreateChapterRequest, UpdateChapterRequest, ChapterResponse};
use crate::utils::api_response::{ApiResponse, success_response, error_response};
use crate::errors::AppError;

pub fn routes(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    let chapters_base = warp::path("chapters");
    
    let get_all_chapters = chapters_base
        .and(warp::get())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_all_chapters_handler);

    let get_chapter_by_id = chapters_base
        .and(warp::get())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_chapter_by_id_handler);

    let get_chapters_by_classic = warp::path("classics")
        .and(warp::path::param::<Uuid>())
        .and(warp::path("chapters"))
        .and(warp::get())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_chapters_by_classic_handler);

    let create_chapter = chapters_base
        .and(warp::post())
        .and(warp::path::end())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and_then(create_chapter_handler);

    let update_chapter = chapters_base
        .and(warp::put())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and_then(update_chapter_handler);

    let delete_chapter = chapters_base
        .and(warp::delete())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(with_state(state))
        .and_then(delete_chapter_handler);

    get_all_chapters
        .or(get_chapter_by_id)
        .or(get_chapters_by_classic)
        .or(create_chapter)
        .or(update_chapter)
        .or(delete_chapter)
}

fn with_state(
    state: AppState
) -> impl Filter<Extract = (AppState,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}

async fn get_all_chapters_handler(
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::find_all(&state.db_pool).await {
        Ok(chapters) => {
            let responses: Vec<ChapterResponse> = chapters.into_iter().map(|c| c.into()).collect();
            Ok(json(&success_response(responses)))
        }
        Err(e) => {
            tracing::error!("Failed to fetch chapters: {}", e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn get_chapter_by_id_handler(
    id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::find_by_id(&state.db_pool, id).await {
        Ok(Some(chapter)) => {
            let response: ChapterResponse = chapter.into();
            Ok(json(&success_response(response)))
        }
        Ok(None) => {
            Err(warp::reject::custom(AppError::NotFound("Chapter not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to fetch chapter {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn get_chapters_by_classic_handler(
    classic_id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::find_by_classic_id(&state.db_pool, classic_id).await {
        Ok(chapters) => {
            let responses: Vec<ChapterResponse> = chapters.into_iter().map(|c| c.into()).collect();
            Ok(json(&success_response(responses)))
        }
        Err(e) => {
            tracing::error!("Failed to fetch chapters for classic {}: {}", classic_id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn create_chapter_handler(
    req: CreateChapterRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::create(&state.db_pool, req).await {
        Ok(chapter) => {
            let response: ChapterResponse = chapter.into();
            Ok(warp::reply::with_status(
                json(&success_response(response)),
                warp::http::StatusCode::CREATED
            ))
        }
        Err(e) => {
            tracing::error!("Failed to create chapter: {}", e);
            if e.to_string().contains("duplicate key") {
                Err(warp::reject::custom(AppError::BadRequest("Chapter number already exists for this classic".to_string())))
            } else {
                Err(warp::reject::custom(AppError::DatabaseError))
            }
        }
    }
}

async fn update_chapter_handler(
    id: Uuid,
    req: UpdateChapterRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::update(&state.db_pool, id, req).await {
        Ok(Some(chapter)) => {
            let response: ChapterResponse = chapter.into();
            Ok(json(&success_response(response)))
        }
        Ok(None) => {
            Err(warp::reject::custom(AppError::NotFound("Chapter not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to update chapter {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn delete_chapter_handler(
    id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Chapter::delete(&state.db_pool, id).await {
        Ok(true) => {
            Ok(json(&success_response("Chapter deleted successfully")))
        }
        Ok(false) => {
            Err(warp::reject::custom(AppError::NotFound("Chapter not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to delete chapter {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}