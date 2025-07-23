use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Classic {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub author: Option<String>,
    pub dynasty: Option<String>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateClassicRequest {
    pub slug: String,
    pub title: String,
    pub author: Option<String>,
    pub dynasty: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateClassicRequest {
    pub title: Option<String>,
    pub author: Option<String>,
    pub dynasty: Option<String>,
    pub description: Option<String>,
}

impl Classic {
    pub async fn find_all(pool: &PgPool) -> Result<Vec<Classic>> {
        let classics = sqlx::query_as::<_, Classic>(
            "SELECT id, slug, title, author, dynasty, description, created_at, updated_at 
             FROM classics 
             ORDER BY created_at ASC"
        )
        .fetch_all(pool)
        .await?;

        Ok(classics)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Classic>> {
        let classic = sqlx::query_as::<_, Classic>(
            "SELECT id, slug, title, author, dynasty, description, created_at, updated_at 
             FROM classics 
             WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(classic)
    }

    pub async fn find_by_slug(pool: &PgPool, slug: &str) -> Result<Option<Classic>> {
        let classic = sqlx::query_as::<_, Classic>(
            "SELECT id, slug, title, author, dynasty, description, created_at, updated_at 
             FROM classics 
             WHERE slug = $1"
        )
        .bind(slug)
        .fetch_optional(pool)
        .await?;

        Ok(classic)
    }

    pub async fn create(pool: &PgPool, req: CreateClassicRequest) -> Result<Classic> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        let classic = sqlx::query_as::<_, Classic>(
            "INSERT INTO classics (id, slug, title, author, dynasty, description, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, slug, title, author, dynasty, description, created_at, updated_at"
        )
        .bind(id)
        .bind(&req.slug)
        .bind(&req.title)
        .bind(&req.author)
        .bind(&req.dynasty)
        .bind(&req.description)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;

        Ok(classic)
    }

    pub async fn update(pool: &PgPool, id: Uuid, req: UpdateClassicRequest) -> Result<Option<Classic>> {
        let now = Utc::now();

        let classic = sqlx::query_as::<_, Classic>(
            "UPDATE classics 
             SET title = COALESCE($2, title),
                 author = COALESCE($3, author),
                 dynasty = COALESCE($4, dynasty),
                 description = COALESCE($5, description),
                 updated_at = $6
             WHERE id = $1
             RETURNING id, slug, title, author, dynasty, description, created_at, updated_at"
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.author)
        .bind(&req.dynasty)
        .bind(&req.description)
        .bind(now)
        .fetch_optional(pool)
        .await?;

        Ok(classic)
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query("DELETE FROM classics WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}