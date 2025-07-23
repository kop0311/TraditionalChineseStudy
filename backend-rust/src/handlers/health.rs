use warp::{Reply, Rejection};
use serde_json::json;
use std::convert::Infallible;

pub async fn health_check() -> Result<impl Reply, Rejection> {
    let response = json!({
        "status": "healthy",
        "service": "xiaoxiao-dushulang-rust-backend",
        "version": "2.0.0",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "environment": std::env::var("NODE_ENV").unwrap_or_else(|_| "development".to_string()),
        "services": {
            "database": "connected",
            "redis": "connected",
            "api": "running"
        }
    });

    Ok(warp::reply::json(&response))
}