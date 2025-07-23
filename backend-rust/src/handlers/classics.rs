use warp::{Filter, Reply, Rejection, reply::json};
use serde_json::json;
use uuid::Uuid;

use crate::{
    models::{Classic, CreateClassicRequest, UpdateClassicRequest},
    handlers::AppState,
    utils::api_response::{ApiResponse, success_response, error_response},
};

pub fn routes(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    list_classics(state.clone())
        .or(get_classic(state.clone()))
        .or(create_classic(state.clone()))
        .or(update_classic(state.clone()))
        .or(delete_classic(state))
}

// GET /api/classics
fn list_classics(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("classics")
        .and(warp::get())
        .and(warp::any().map(move || state.clone()))
        .and_then(list_classics_handler)
}

// GET /api/classics/:slug
fn get_classic(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("classics")
        .and(warp::path::param::<String>())
        .and(warp::get())
        .and(warp::any().map(move || state.clone()))
        .and_then(get_classic_handler)
}

// POST /api/classics
fn create_classic(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("classics")
        .and(warp::post())
        .and(warp::body::json())
        .and(warp::any().map(move || state.clone()))
        .and_then(create_classic_handler)
}

// PUT /api/classics/:id
fn update_classic(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("classics")
        .and(warp::path::param::<Uuid>())
        .and(warp::put())
        .and(warp::body::json())
        .and(warp::any().map(move || state.clone()))
        .and_then(update_classic_handler)
}

// DELETE /api/classics/:id
fn delete_classic(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("classics")
        .and(warp::path::param::<Uuid>())
        .and(warp::delete())
        .and(warp::any().map(move || state.clone()))
        .and_then(delete_classic_handler)
}

async fn list_classics_handler(state: AppState) -> Result<impl Reply, Rejection> {
    match Classic::find_all(state.db.pool()).await {
        Ok(classics) => {
            let response = success_response(classics);
            Ok(json(&response))
        }
        Err(e) => {
            tracing::error!("获取经典列表失败: {}", e);
            let response = error_response("获取经典列表失败");
            Ok(json(&response))
        }
    }
}

async fn get_classic_handler(slug: String, state: AppState) -> Result<impl Reply, Rejection> {
    // Validate slug format
    if !slug.chars().all(|c| c.is_alphanumeric() || c == '-') {
        let response = error_response("无效的经典标识符");
        return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::BAD_REQUEST));
    }

    match Classic::find_by_slug(state.db.pool(), &slug).await {
        Ok(Some(classic)) => {
            let response = success_response(classic);
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::OK))
        }
        Ok(None) => {
            let response = error_response("经典未找到");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::NOT_FOUND))
        }
        Err(e) => {
            tracing::error!("获取经典详情失败: {}", e);
            let response = error_response("获取经典详情失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

async fn create_classic_handler(
    create_req: CreateClassicRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    // Basic validation
    if create_req.title.is_empty() || create_req.slug.is_empty() {
        let response = error_response("标题和标识符不能为空");
        return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::BAD_REQUEST));
    }

    // Check if slug already exists
    match Classic::find_by_slug(state.db.pool(), &create_req.slug).await {
        Ok(Some(_)) => {
            let response = error_response("该标识符已存在");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::CONFLICT));
        }
        Ok(None) => {}
        Err(e) => {
            tracing::error!("检查标识符唯一性失败: {}", e);
            let response = error_response("创建经典失败");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR));
        }
    }

    match Classic::create(state.db.pool(), create_req).await {
        Ok(classic) => {
            let response = success_response(classic);
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::CREATED))
        }
        Err(e) => {
            tracing::error!("创建经典失败: {}", e);
            let response = error_response("创建经典失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

async fn update_classic_handler(
    id: Uuid,
    update_req: UpdateClassicRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Classic::update(state.db.pool(), id, update_req).await {
        Ok(Some(classic)) => {
            let response = success_response(classic);
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::OK))
        }
        Ok(None) => {
            let response = error_response("经典未找到");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::NOT_FOUND))
        }
        Err(e) => {
            tracing::error!("更新经典失败: {}", e);
            let response = error_response("更新经典失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

async fn delete_classic_handler(id: Uuid, state: AppState) -> Result<impl Reply, Rejection> {
    match Classic::delete(state.db.pool(), id).await {
        Ok(true) => {
            let response = success_response(json!({"message": "经典删除成功"}));
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::OK))
        }
        Ok(false) => {
            let response = error_response("经典未找到");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::NOT_FOUND))
        }
        Err(e) => {
            tracing::error!("删除经典失败: {}", e);
            let response = error_response("删除经典失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}