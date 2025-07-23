use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Type};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::Result;
use bcrypt::{hash, verify, DEFAULT_COST};

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Parent,
    Admin,
    Child,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub phone: Option<String>,
    pub role: UserRole,
    pub is_active: bool,
    pub last_login: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub phone: Option<String>,
    pub role: Option<UserRole>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub username: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub is_active: Option<bool>,
}

impl User {
    pub async fn find_all(pool: &PgPool) -> Result<Vec<User>> {
        let users = sqlx::query_as::<_, User>(
            "SELECT id, username, email, password, phone, role, is_active, last_login, created_at, updated_at 
             FROM users 
             ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await?;

        Ok(users)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, username, email, password, phone, role, is_active, last_login, created_at, updated_at 
             FROM users 
             WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, username, email, password, phone, role, is_active, last_login, created_at, updated_at 
             FROM users 
             WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_username(pool: &PgPool, username: &str) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, username, email, password, phone, role, is_active, last_login, created_at, updated_at 
             FROM users 
             WHERE username = $1"
        )
        .bind(username)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn create(pool: &PgPool, req: CreateUserRequest) -> Result<User> {
        let id = Uuid::new_v4();
        let now = Utc::now();
        let hashed_password = hash(&req.password, DEFAULT_COST)?;
        let role = req.role.unwrap_or(UserRole::Parent);

        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users (id, username, email, password, phone, role, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, username, email, password, phone, role, is_active, last_login, created_at, updated_at"
        )
        .bind(id)
        .bind(&req.username)
        .bind(&req.email)
        .bind(&hashed_password)
        .bind(&req.phone)
        .bind(&role)
        .bind(true)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    pub async fn update_last_login(pool: &PgPool, id: Uuid) -> Result<()> {
        let now = Utc::now();

        sqlx::query("UPDATE users SET last_login = $1, updated_at = $2 WHERE id = $3")
            .bind(now)
            .bind(now)
            .bind(id)
            .execute(pool)
            .await?;

        Ok(())
    }

    pub fn verify_password(&self, password: &str) -> Result<bool> {
        Ok(verify(password, &self.password)?)
    }

    pub async fn update(pool: &PgPool, id: Uuid, req: UpdateUserRequest) -> Result<Option<User>> {
        let now = Utc::now();

        let user = sqlx::query_as::<_, User>(
            "UPDATE users 
             SET username = COALESCE($2, username),
                 email = COALESCE($3, email),
                 phone = COALESCE($4, phone),
                 is_active = COALESCE($5, is_active),
                 updated_at = $6
             WHERE id = $1
             RETURNING id, username, email, password, phone, role, is_active, last_login, created_at, updated_at"
        )
        .bind(id)
        .bind(&req.username)
        .bind(&req.email)
        .bind(&req.phone)
        .bind(&req.is_active)
        .bind(now)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}