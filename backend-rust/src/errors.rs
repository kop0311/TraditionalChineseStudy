use warp::{Rejection, Reply, reply};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Redis错误: {0}")]
    Redis(#[from] redis::RedisError),
    
    #[error("JWT错误: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),
    
    #[error("BCrypt错误: {0}")]
    BCrypt(#[from] bcrypt::BcryptError),
    
    #[error("验证错误: {0}")]
    Validation(String),
    
    #[error("未找到")]
    NotFound,
    
    #[error("未授权")]
    Unauthorized,
    
    #[error("内部服务器错误")]
    Internal,
}

impl warp::reject::Reject for AppError {}

pub async fn handle_rejection(err: Rejection) -> Result<impl Reply, std::convert::Infallible> {
    let code;
    let message;

    if err.is_not_found() {
        code = warp::http::StatusCode::NOT_FOUND;
        message = "路由未找到";
    } else if let Some(app_err) = err.find::<AppError>() {
        match app_err {
            AppError::NotFound => {
                code = warp::http::StatusCode::NOT_FOUND;
                message = "资源未找到";
            }
            AppError::Unauthorized => {
                code = warp::http::StatusCode::UNAUTHORIZED;
                message = "未授权访问";
            }
            AppError::Validation(msg) => {
                code = warp::http::StatusCode::BAD_REQUEST;
                message = msg;
            }
            AppError::Database(_) | AppError::Redis(_) | AppError::Internal => {
                code = warp::http::StatusCode::INTERNAL_SERVER_ERROR;
                message = "内部服务器错误";
            }
            AppError::Jwt(_) | AppError::BCrypt(_) => {
                code = warp::http::StatusCode::UNAUTHORIZED;
                message = "身份验证失败";
            }
        }
    } else if err.find::<warp::filters::body::BodyDeserializeError>().is_some() {
        code = warp::http::StatusCode::BAD_REQUEST;
        message = "请求体格式错误";
    } else if err.find::<warp::reject::MethodNotAllowed>().is_some() {
        code = warp::http::StatusCode::METHOD_NOT_ALLOWED;
        message = "HTTP方法不允许";
    } else {
        tracing::error!("未处理的拒绝错误: {:?}", err);
        code = warp::http::StatusCode::INTERNAL_SERVER_ERROR;
        message = "内部服务器错误";
    }

    let json = json!({
        "success": false,
        "error": message,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "status_code": code.as_u16()
    });

    Ok(reply::with_status(reply::json(&json), code))
}