use std::env;
use warp::{Filter, Reply};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use chrono::{Utc, Duration};
use uuid::Uuid;
use validator::Validate;

use crate::models::{User, LoginRequest, LoginResponse, Claims, ErrorResponse};
use crate::schema::users;

type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn auth_routes(
    db_pool: DbPool,
) -> impl Filter<Extract = impl Reply, Error = warp::Rejection> + Clone {
    let login = warp::path("auth")
        .and(warp::path("login"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_db(db_pool.clone()))
        .and_then(login_handler);

    let refresh = warp::path("auth")
        .and(warp::path("refresh"))
        .and(warp::post())
        .and(warp::header::<String>("authorization"))
        .and(with_db(db_pool))
        .and_then(refresh_handler);

    login.or(refresh)
}

fn with_db(db_pool: DbPool) -> impl Filter<Extract = (DbPool,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db_pool.clone())
}

async fn login_handler(
    login_req: LoginRequest,
    db_pool: DbPool,
) -> Result<impl Reply, warp::Rejection> {
    // Validate input
    if let Err(validation_errors) = login_req.validate() {
        return Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Validation Error".to_string(),
                message: format!("Invalid input: {:?}", validation_errors),
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

    // Find user by email
    let user = match users::table
        .filter(users::email.eq(&login_req.email))
        .first::<User>(&mut conn)
    {
        Ok(user) => user,
        Err(diesel::NotFound) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Authentication Failed".to_string(),
                    message: "Invalid email or password".to_string(),
                    code: 401,
                }),
                warp::http::StatusCode::UNAUTHORIZED,
            ));
        }
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Database Error".to_string(),
                    message: "Failed to query user".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    // Verify password
    match verify(&login_req.password, &user.password_hash) {
        Ok(true) => {
            // Generate JWT token
            let expires_at = Utc::now() + Duration::hours(24);
            let claims = Claims {
                sub: user.id.to_string(),
                email: user.email.clone(),
                exp: expires_at.timestamp() as usize,
                iat: Utc::now().timestamp() as usize,
            };

            let jwt_secret = env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-secret-key".to_string());
            
            let token = match encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(jwt_secret.as_ref()),
            ) {
                Ok(token) => token,
                Err(_) => {
                    return Ok(warp::reply::with_status(
                        warp::reply::json(&ErrorResponse {
                            error: "Token Generation Error".to_string(),
                            message: "Failed to generate JWT token".to_string(),
                            code: 500,
                        }),
                        warp::http::StatusCode::INTERNAL_SERVER_ERROR,
                    ));
                }
            };

            let response = LoginResponse {
                token,
                user_id: user.id,
                email: user.email,
                expires_at,
            };

            Ok(warp::reply::with_status(
                warp::reply::json(&response),
                warp::http::StatusCode::OK,
            ))
        }
        Ok(false) => Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Authentication Failed".to_string(),
                message: "Invalid email or password".to_string(),
                code: 401,
            }),
            warp::http::StatusCode::UNAUTHORIZED,
        )),
        Err(_) => Ok(warp::reply::with_status(
            warp::reply::json(&ErrorResponse {
                error: "Server Error".to_string(),
                message: "Password verification failed".to_string(),
                code: 500,
            }),
            warp::http::StatusCode::INTERNAL_SERVER_ERROR,
        )),
    }
}

async fn refresh_handler(
    auth_header: String,
    db_pool: DbPool,
) -> Result<impl Reply, warp::Rejection> {
    let token = auth_header.strip_prefix("Bearer ").unwrap_or(&auth_header);
    
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| "your-secret-key".to_string());

    let claims = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(token_data) => token_data.claims,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Invalid Token".to_string(),
                    message: "Token is invalid or expired".to_string(),
                    code: 401,
                }),
                warp::http::StatusCode::UNAUTHORIZED,
            ));
        }
    };

    // Generate new token
    let expires_at = Utc::now() + Duration::hours(24);
    let new_claims = Claims {
        sub: claims.sub,
        email: claims.email.clone(),
        exp: expires_at.timestamp() as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let new_token = match encode(
        &Header::default(),
        &new_claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    ) {
        Ok(token) => token,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&ErrorResponse {
                    error: "Token Generation Error".to_string(),
                    message: "Failed to generate new JWT token".to_string(),
                    code: 500,
                }),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    let response = LoginResponse {
        token: new_token,
        user_id: Uuid::parse_str(&new_claims.sub).unwrap(),
        email: new_claims.email,
        expires_at,
    };

    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        warp::http::StatusCode::OK,
    ))
}

// Helper function to create password hash
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}
