use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

use crate::schema::{users, hanzi, comments};

// User model
#[derive(Debug, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = users)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Insertable)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
}

// Hanzi character model
#[derive(Debug, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = hanzi)]
pub struct HanziCharacter {
    pub id: i32,
    pub character: String,
    pub pinyin: String,
    pub meaning: String,
    pub stroke_count: i32,
    pub level: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Insertable)]
#[diesel(table_name = hanzi)]
pub struct NewHanziCharacter {
    pub character: String,
    pub pinyin: String,
    pub meaning: String,
    pub stroke_count: i32,
    pub level: i32,
}

// Comment model
#[derive(Debug, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = comments)]
pub struct Comment {
    pub id: i32,
    pub text: String,
    pub user_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Insertable, Validate)]
#[diesel(table_name = comments)]
pub struct NewComment {
    #[validate(length(min = 1, max = 200, message = "Comment text must be between 1 and 200 characters"))]
    pub text: String,
    #[validate(range(min = 1, message = "User ID must be a positive integer"))]
    pub user_id: Uuid,
}

// Authentication models
#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
    #[validate(length(min = 6, message = "Password must be at least 6 characters"))]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: Uuid,
    pub email: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub code: u16,
}

// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub email: String,
    pub exp: usize,  // expiration time
    pub iat: usize,  // issued at
}

// Pagination
#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

impl Default for PaginationQuery {
    fn default() -> Self {
        Self {
            page: Some(1),
            limit: Some(20),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub page: i64,
    pub limit: i64,
    pub total: i64,
    pub total_pages: i64,
}

// Character query filters
#[derive(Debug, Deserialize)]
pub struct CharacterQuery {
    pub level: Option<i32>,
    pub stroke_count: Option<i32>,
    pub search: Option<String>,
    #[serde(flatten)]
    pub pagination: PaginationQuery,
}
