use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Sentence {
    pub id: Uuid,
    pub chapter_id: Uuid,
    pub number: i32,
    pub text: String,
    pub pinyin: Option<String>,
    pub translation: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSentenceRequest {
    pub chapter_id: Uuid,
    pub number: i32,
    pub text: String,
    pub pinyin: Option<String>,
    pub translation: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSentenceRequest {
    pub number: Option<i32>,
    pub text: Option<String>,
    pub pinyin: Option<String>,
    pub translation: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SentenceResponse {
    pub id: Uuid,
    pub chapter_id: Uuid,
    pub number: i32,
    pub text: String,
    pub pinyin: Option<String>,
    pub translation: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Sentence> for SentenceResponse {
    fn from(sentence: Sentence) -> Self {
        SentenceResponse {
            id: sentence.id,
            chapter_id: sentence.chapter_id,
            number: sentence.number,
            text: sentence.text,
            pinyin: sentence.pinyin,
            translation: sentence.translation,
            created_at: sentence.created_at,
            updated_at: sentence.updated_at,
        }
    }
}

impl Sentence {
    pub async fn find_all(pool: &PgPool) -> Result<Vec<Sentence>> {
        let sentences = sqlx::query_as::<_, Sentence>(
            "SELECT id, chapter_id, number, text, pinyin, translation, created_at, updated_at 
             FROM sentences 
             ORDER BY chapter_id, number ASC"
        )
        .fetch_all(pool)
        .await?;
        Ok(sentences)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Sentence>> {
        let sentence = sqlx::query_as::<_, Sentence>(
            "SELECT id, chapter_id, number, text, pinyin, translation, created_at, updated_at 
             FROM sentences 
             WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(sentence)
    }

    pub async fn find_by_chapter_id(pool: &PgPool, chapter_id: Uuid) -> Result<Vec<Sentence>> {
        let sentences = sqlx::query_as::<_, Sentence>(
            "SELECT id, chapter_id, number, text, pinyin, translation, created_at, updated_at 
             FROM sentences 
             WHERE chapter_id = $1 
             ORDER BY number ASC"
        )
        .bind(chapter_id)
        .fetch_all(pool)
        .await?;
        Ok(sentences)
    }

    pub async fn create(pool: &PgPool, req: CreateSentenceRequest) -> Result<Sentence> {
        let id = Uuid::new_v4();
        let now = Utc::now();
        
        let sentence = sqlx::query_as::<_, Sentence>(
            "INSERT INTO sentences (id, chapter_id, number, text, pinyin, translation, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING id, chapter_id, number, text, pinyin, translation, created_at, updated_at"
        )
        .bind(id)
        .bind(req.chapter_id)
        .bind(req.number)
        .bind(req.text)
        .bind(req.pinyin)
        .bind(req.translation)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;
        Ok(sentence)
    }

    pub async fn update(pool: &PgPool, id: Uuid, req: UpdateSentenceRequest) -> Result<Option<Sentence>> {
        let now = Utc::now();
        
        let sentence = sqlx::query_as::<_, Sentence>(
            "UPDATE sentences 
             SET number = COALESCE($2, number),
                 text = COALESCE($3, text),
                 pinyin = COALESCE($4, pinyin),
                 translation = COALESCE($5, translation),
                 updated_at = $6
             WHERE id = $1 
             RETURNING id, chapter_id, number, text, pinyin, translation, created_at, updated_at"
        )
        .bind(id)
        .bind(req.number)
        .bind(req.text)
        .bind(req.pinyin)
        .bind(req.translation)
        .bind(now)
        .fetch_optional(pool)
        .await?;
        Ok(sentence)
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query(
            "DELETE FROM sentences WHERE id = $1"
        )
        .bind(id)
        .execute(pool)
        .await?;
        Ok(result.rows_affected() > 0)
    }
}