use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Chapter {
    pub id: Uuid,
    pub classic_id: Uuid,
    pub number: i32,
    pub title: String,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateChapterRequest {
    pub classic_id: Uuid,
    pub number: i32,
    pub title: String,
    pub content: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateChapterRequest {
    pub number: Option<i32>,
    pub title: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChapterResponse {
    pub id: Uuid,
    pub classic_id: Uuid,
    pub number: i32,
    pub title: String,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Chapter> for ChapterResponse {
    fn from(chapter: Chapter) -> Self {
        ChapterResponse {
            id: chapter.id,
            classic_id: chapter.classic_id,
            number: chapter.number,
            title: chapter.title,
            content: chapter.content,
            created_at: chapter.created_at,
            updated_at: chapter.updated_at,
        }
    }
}

impl Chapter {
    pub async fn find_all(pool: &PgPool) -> Result<Vec<Chapter>> {
        let chapters = sqlx::query_as::<_, Chapter>(
            "SELECT id, classic_id, number, title, content, created_at, updated_at 
             FROM chapters 
             ORDER BY classic_id, number ASC"
        )
        .fetch_all(pool)
        .await?;
        Ok(chapters)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Chapter>> {
        let chapter = sqlx::query_as::<_, Chapter>(
            "SELECT id, classic_id, number, title, content, created_at, updated_at 
             FROM chapters 
             WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(chapter)
    }

    pub async fn find_by_classic_id(pool: &PgPool, classic_id: Uuid) -> Result<Vec<Chapter>> {
        let chapters = sqlx::query_as::<_, Chapter>(
            "SELECT id, classic_id, number, title, content, created_at, updated_at 
             FROM chapters 
             WHERE classic_id = $1 
             ORDER BY number ASC"
        )
        .bind(classic_id)
        .fetch_all(pool)
        .await?;
        Ok(chapters)
    }

    pub async fn create(pool: &PgPool, req: CreateChapterRequest) -> Result<Chapter> {
        let id = Uuid::new_v4();
        let now = Utc::now();
        
        let chapter = sqlx::query_as::<_, Chapter>(
            "INSERT INTO chapters (id, classic_id, number, title, content, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, classic_id, number, title, content, created_at, updated_at"
        )
        .bind(id)
        .bind(req.classic_id)
        .bind(req.number)
        .bind(req.title)
        .bind(req.content)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;
        Ok(chapter)
    }

    pub async fn update(pool: &PgPool, id: Uuid, req: UpdateChapterRequest) -> Result<Option<Chapter>> {
        let now = Utc::now();
        
        let chapter = sqlx::query_as::<_, Chapter>(
            "UPDATE chapters 
             SET number = COALESCE($2, number),
                 title = COALESCE($3, title),
                 content = COALESCE($4, content),
                 updated_at = $5
             WHERE id = $1 
             RETURNING id, classic_id, number, title, content, created_at, updated_at"
        )
        .bind(id)
        .bind(req.number)
        .bind(req.title)
        .bind(req.content)
        .bind(now)
        .fetch_optional(pool)
        .await?;
        Ok(chapter)
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query(
            "DELETE FROM chapters WHERE id = $1"
        )
        .bind(id)
        .execute(pool)
        .await?;
        Ok(result.rows_affected() > 0)
    }
}