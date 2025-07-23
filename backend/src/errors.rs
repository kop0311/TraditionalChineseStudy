use thiserror::Error;
use warp::{reject::Reject, Rejection, Reply};
use serde::Serialize;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    
    #[error("Redis error: {0}")]
    RedisError(#[from] redis::RedisError),
    
    #[error("JWT error: {0}")]
    JwtError(#[from] jsonwebtoken::errors::Error),
    
    #[error("Validation error: {message}")]
    ValidationError { message: String },
    
    #[error("Authentication failed")]
    AuthenticationError,
    
    #[error("Authorization failed")]
    AuthorizationError,
    
    #[error("Not found")]
    NotFound,
    
    #[error("Internal server error")]
    InternalServerError,
}

impl Reject for ApiError {}

#[derive(Serialize)]
struct ErrorMessage {
    code: u16,
    message: String,
}

pub async fn handle_rejection(err: Rejection) -> Result<impl Reply, std::convert::Infallible> {
    let code;
    let message;

    if err.is_not_found() {
        code = 404;
        message = "Not Found";
    } else if let Some(api_error) = err.find::<ApiError>() {
        match api_error {
            ApiError::DatabaseError(_) => {
                code = 500;
                message = "Database error";
            }
            ApiError::ValidationError { message: msg } => {
                code = 400;
                message = msg;
            }
            ApiError::AuthenticationError => {
                code = 401;
                message = "Authentication failed";
            }
            ApiError::AuthorizationError => {
                code = 403;
                message = "Authorization failed";
            }
            ApiError::NotFound => {
                code = 404;
                message = "Not found";
            }
            _ => {
                code = 500;
                message = "Internal server error";
            }
        }
    } else if err.find::<warp::filters::body::BodyDeserializeError>().is_some() {
        code = 400;
        message = "Invalid request body";
    } else if err.find::<warp::reject::MethodNotAllowed>().is_some() {
        code = 405;
        message = "Method not allowed";
    } else {
        code = 500;
        message = "Internal server error";
    }

    let json = warp::reply::json(&ErrorMessage {
        code,
        message: message.into(),
    });

    Ok(warp::reply::with_status(json, warp::http::StatusCode::from_u16(code).unwrap()))
}
