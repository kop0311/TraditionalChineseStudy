use warp::{Filter, Reply};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use validator::Validate;

use crate::models::{NewComment, ErrorResponse};
use crate::schema::comments;

type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn validation_routes(
    db_pool: DbPool,
) -> impl Filter<Extract = impl Reply, Error = warp::Rejection> + Clone {
    let create_comment = warp::path("comment")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_db(db_pool))
        .and_then(create_comment_handler);

    create_comment
}

fn with_db(db_pool: DbPool) -> impl Filter<Extract = (DbPool,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db_pool.clone())
}

async fn create_comment_handler(
    new_comment: NewComment,
    db_pool: DbPool,
) -> Result<impl Reply, warp::Rejection> {
    // Validate input
    if let Err(validation_errors) = new_comment.validate() {
        let error_messages: Vec<String> = validation_errors
            .field_errors()
            .iter()
            .flat_map(|(field, errors)| {
                errors.iter().map(move |error| {
                    format!("{}: {}", field, error.message.as_ref().unwrap_or(&"Invalid value".into()))
                })
            })
            .collect();

        return Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Validation Error".to_string(),
                message: error_messages.join(", "),
                code: 400,
            }),
            warp::http::StatusCode::BAD_REQUEST,
        ));
    }

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

    match diesel::insert_into(comments::table)
        .values(&new_comment)
        .execute(&mut conn)
    {
        Ok(_) => Ok(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({"message": "Comment created successfully"})),
            warp::http::StatusCode::CREATED,
        )),
        Err(_) => Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Database Error".to_string(),
                message: "Failed to create comment".to_string(),
                code: 500,
            }),
            warp::http::StatusCode::INTERNAL_SERVER_ERROR,
        )),
    }
}
