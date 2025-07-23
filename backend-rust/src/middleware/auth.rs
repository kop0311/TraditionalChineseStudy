use warp::{Filter, Rejection};
use crate::utils::jwt::verify_jwt_token;

pub fn with_auth(
    secret: String,
) -> impl Filter<Extract = (uuid::Uuid,), Error = Rejection> + Clone {
    warp::header::<String>("authorization")
        .and_then(move |auth_header: String| {
            let secret = secret.clone();
            async move {
                if let Some(token) = auth_header.strip_prefix("Bearer ") {
                    match verify_jwt_token(token, &secret) {
                        Ok(claims) => {
                            if let Ok(user_id) = uuid::Uuid::parse_str(&claims.sub) {
                                Ok(user_id)
                            } else {
                                Err(warp::reject::custom(crate::errors::AppError::Unauthorized))
                            }
                        }
                        Err(_) => Err(warp::reject::custom(crate::errors::AppError::Unauthorized)),
                    }
                } else {
                    Err(warp::reject::custom(crate::errors::AppError::Unauthorized))
                }
            }
        })
}