use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub timestamp: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
}

pub fn success_response<T: Serialize>(data: T) -> ApiResponse<T> {
    ApiResponse {
        success: true,
        data: Some(data),
        error: None,
        timestamp: Utc::now(),
        path: None,
    }
}

pub fn error_response(message: &str) -> ApiResponse<()> {
    ApiResponse {
        success: false,
        data: None,
        error: Some(message.to_string()),
        timestamp: Utc::now(),
        path: None,
    }
}

pub fn success_response_with_path<T: Serialize>(data: T, path: &str) -> ApiResponse<T> {
    ApiResponse {
        success: true,
        data: Some(data),
        error: None,
        timestamp: Utc::now(),
        path: Some(path.to_string()),
    }
}

pub fn error_response_with_path(message: &str, path: &str) -> ApiResponse<()> {
    ApiResponse {
        success: false,
        data: None,
        error: Some(message.to_string()),
        timestamp: Utc::now(),
        path: Some(path.to_string()),
    }
}