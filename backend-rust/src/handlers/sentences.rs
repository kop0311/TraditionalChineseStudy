use warp::{Filter, Reply, Rejection, reply::json};
use uuid::Uuid;
use crate::handlers::AppState;
use crate::models::sentence::{Sentence, CreateSentenceRequest, UpdateSentenceRequest, SentenceResponse};
use crate::utils::api_response::{ApiResponse, success_response, error_response};
use crate::errors::AppError;

pub fn routes(
    state: AppState
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    let sentences_base = warp::path("sentences");
    
    let get_all_sentences = sentences_base
        .and(warp::get())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_all_sentences_handler);

    let get_sentence_by_id = sentences_base
        .and(warp::get())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_sentence_by_id_handler);

    let get_sentences_by_chapter = warp::path("chapters")
        .and(warp::path::param::<Uuid>())
        .and(warp::path("sentences"))
        .and(warp::get())
        .and(warp::path::end())
        .and(with_state(state.clone()))
        .and_then(get_sentences_by_chapter_handler);

    let create_sentence = sentences_base
        .and(warp::post())
        .and(warp::path::end())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and_then(create_sentence_handler);

    let update_sentence = sentences_base
        .and(warp::put())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and_then(update_sentence_handler);

    let delete_sentence = sentences_base
        .and(warp::delete())
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(with_state(state))
        .and_then(delete_sentence_handler);

    get_all_sentences
        .or(get_sentence_by_id)
        .or(get_sentences_by_chapter)
        .or(create_sentence)
        .or(update_sentence)
        .or(delete_sentence)
}

fn with_state(
    state: AppState
) -> impl Filter<Extract = (AppState,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}

async fn get_all_sentences_handler(
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::find_all(&state.db_pool).await {
        Ok(sentences) => {
            let responses: Vec<SentenceResponse> = sentences.into_iter().map(|s| s.into()).collect();
            Ok(json(&success_response(responses)))
        }
        Err(e) => {
            tracing::error!("Failed to fetch sentences: {}", e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn get_sentence_by_id_handler(
    id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::find_by_id(&state.db_pool, id).await {
        Ok(Some(sentence)) => {
            let response: SentenceResponse = sentence.into();
            Ok(json(&success_response(response)))
        }
        Ok(None) => {
            Err(warp::reject::custom(AppError::NotFound("Sentence not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to fetch sentence {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn get_sentences_by_chapter_handler(
    chapter_id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::find_by_chapter_id(&state.db_pool, chapter_id).await {
        Ok(sentences) => {
            let responses: Vec<SentenceResponse> = sentences.into_iter().map(|s| s.into()).collect();
            Ok(json(&success_response(responses)))
        }
        Err(e) => {
            tracing::error!("Failed to fetch sentences for chapter {}: {}", chapter_id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn create_sentence_handler(
    req: CreateSentenceRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::create(&state.db_pool, req).await {
        Ok(sentence) => {
            let response: SentenceResponse = sentence.into();
            Ok(warp::reply::with_status(
                json(&success_response(response)),
                warp::http::StatusCode::CREATED
            ))
        }
        Err(e) => {
            tracing::error!("Failed to create sentence: {}", e);
            if e.to_string().contains("duplicate key") {
                Err(warp::reject::custom(AppError::BadRequest("Sentence number already exists for this chapter".to_string())))
            } else {
                Err(warp::reject::custom(AppError::DatabaseError))
            }
        }
    }
}

async fn update_sentence_handler(
    id: Uuid,
    req: UpdateSentenceRequest,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::update(&state.db_pool, id, req).await {
        Ok(Some(sentence)) => {
            let response: SentenceResponse = sentence.into();
            Ok(json(&success_response(response)))
        }
        Ok(None) => {
            Err(warp::reject::custom(AppError::NotFound("Sentence not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to update sentence {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}

async fn delete_sentence_handler(
    id: Uuid,
    state: AppState
) -> Result<impl Reply, Rejection> {
    match Sentence::delete(&state.db_pool, id).await {
        Ok(true) => {
            Ok(json(&success_response("Sentence deleted successfully")))
        }
        Ok(false) => {
            Err(warp::reject::custom(AppError::NotFound("Sentence not found".to_string())))
        }
        Err(e) => {
            tracing::error!("Failed to delete sentence {}: {}", id, e);
            Err(warp::reject::custom(AppError::DatabaseError))
        }
    }
}