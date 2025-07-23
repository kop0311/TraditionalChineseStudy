use warp::{Filter, Reply, Rejection, reply::json};
use serde_json::json;
use uuid::Uuid;

use crate::{
    models::{User, CreateUserRequest, LoginRequest},
    handlers::AppState,
    utils::{
        api_response::{success_response, error_response},
        jwt::create_jwt_token,
    },
};

pub fn routes(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    register(state.clone())
        .or(login(state.clone()))
        .or(logout(state.clone()))
        .or(me(state))
}

// POST /api/auth/register
fn register(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("auth")
        .and(warp::path("register"))
        .and(warp::post())
        .and(warp::body::json())
        .and(warp::any().map(move || state.clone()))
        .and_then(register_handler)
}

// POST /api/auth/login
fn login(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("auth")
        .and(warp::path("login"))
        .and(warp::post())
        .and(warp::body::json())
        .and(warp::any().map(move || state.clone()))
        .and_then(login_handler)
}

// POST /api/auth/logout
fn logout(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("auth")
        .and(warp::path("logout"))
        .and(warp::post())
        .and(warp::any().map(move || state.clone()))
        .and_then(logout_handler)
}

// GET /api/auth/me
fn me(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    warp::path("auth")
        .and(warp::path("me"))
        .and(warp::get())
        .and(warp::any().map(move || state.clone()))
        .and_then(me_handler)
}

async fn register_handler(
    register_req: CreateUserRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    // Basic validation
    if register_req.email.is_empty() || register_req.password.is_empty() || register_req.username.is_empty() {
        let response = error_response("用户名、邮箱和密码不能为空");
        return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::BAD_REQUEST));
    }

    // Check if user already exists
    match User::find_by_email(state.db.pool(), &register_req.email).await {
        Ok(Some(_)) => {
            let response = error_response("该邮箱已被注册");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::CONFLICT));
        }
        Ok(None) => {}
        Err(e) => {
            tracing::error!("检查用户邮箱失败: {}", e);
            let response = error_response("注册失败");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR));
        }
    }

    // Check if username already exists
    match User::find_by_username(state.db.pool(), &register_req.username).await {
        Ok(Some(_)) => {
            let response = error_response("该用户名已被使用");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::CONFLICT));
        }
        Ok(None) => {}
        Err(e) => {
            tracing::error!("检查用户名失败: {}", e);
            let response = error_response("注册失败");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR));
        }
    }

    // Create user
    match User::create(state.db.pool(), register_req).await {
        Ok(mut user) => {
            // Remove password from response
            user.password = "".to_string();
            let response = success_response(json!({
                "user": user,
                "message": "注册成功"
            }));
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::CREATED))
        }
        Err(e) => {
            tracing::error!("创建用户失败: {}", e);
            let response = error_response("注册失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

async fn login_handler(
    login_req: LoginRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    // Basic validation
    if login_req.email.is_empty() || login_req.password.is_empty() {
        let response = error_response("邮箱和密码不能为空");
        return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::BAD_REQUEST));
    }

    // Find user by email
    let user = match User::find_by_email(state.db.pool(), &login_req.email).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            let response = error_response("用户名或密码错误");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::UNAUTHORIZED));
        }
        Err(e) => {
            tracing::error!("查找用户失败: {}", e);
            let response = error_response("登录失败");
            return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR));
        }
    };

    // Check if user is active
    if !user.is_active {
        let response = error_response("账户已被禁用");
        return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::UNAUTHORIZED));
    }

    // Verify password
    match user.verify_password(&login_req.password) {
        Ok(true) => {
            // Update last login
            if let Err(e) = User::update_last_login(state.db.pool(), user.id).await {
                tracing::warn!("更新最后登录时间失败: {}", e);
            }

            // Create JWT token
            let token = match create_jwt_token(user.id, &state.config.jwt_secret) {
                Ok(token) => token,
                Err(e) => {
                    tracing::error!("创建JWT令牌失败: {}", e);
                    let response = error_response("登录失败");
                    return Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR));
                }
            };

            // Remove password from response
            let mut user_data = user.clone();
            user_data.password = "".to_string();

            let response = success_response(json!({
                "user": user_data,
                "token": token,
                "message": "登录成功"
            }));
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::OK))
        }
        Ok(false) => {
            let response = error_response("用户名或密码错误");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::UNAUTHORIZED))
        }
        Err(e) => {
            tracing::error!("密码验证失败: {}", e);
            let response = error_response("登录失败");
            Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

async fn logout_handler(state: AppState) -> Result<impl Reply, Rejection> {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token. For additional security, you might want to 
    // implement a token blacklist using Redis.
    
    let response = success_response(json!({
        "message": "登出成功"
    }));
    Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::OK))
}

async fn me_handler(state: AppState) -> Result<impl Reply, Rejection> {
    // This endpoint would typically require JWT authentication middleware
    // For now, return a placeholder response
    let response = error_response("需要身份验证");
    Ok(warp::reply::with_status(json(&response), warp::http::StatusCode::UNAUTHORIZED))
}