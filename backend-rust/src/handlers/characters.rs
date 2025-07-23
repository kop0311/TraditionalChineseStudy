use warp::{Filter, Reply, Rejection};
use crate::handlers::AppState;

pub fn routes(
    _state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    // Placeholder for characters routes
    warp::path("characters")
        .and(warp::get())
        .map(|| warp::reply::json(&serde_json::json!({
            "message": "Characters API - 待实现"
        })))
}