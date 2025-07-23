use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Duration, Utc};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user id
    pub exp: usize,  // expiration time
    pub iat: usize,  // issued at
}

pub fn create_jwt_token(user_id: Uuid, secret: &str) -> Result<String> {
    let now = Utc::now();
    let expiration = now + Duration::hours(24); // Token expires in 24 hours
    
    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    let header = Header::new(Algorithm::HS256);
    let encoding_key = EncodingKey::from_secret(secret.as_ref());
    
    let token = encode(&header, &claims, &encoding_key)?;
    Ok(token)
}

pub fn verify_jwt_token(token: &str, secret: &str) -> Result<Claims> {
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::new(Algorithm::HS256);
    
    let token_data = decode::<Claims>(token, &decoding_key, &validation)?;
    Ok(token_data.claims)
}

pub fn extract_user_id_from_token(token: &str, secret: &str) -> Result<Uuid> {
    let claims = verify_jwt_token(token, secret)?;
    let user_id = Uuid::parse_str(&claims.sub)?;
    Ok(user_id)
}