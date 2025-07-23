use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub session_secret: String,
    pub environment: Environment,
    pub log_level: String,
    pub cors_origins: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Environment {
    Development,
    Production,
    Test,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        let environment = match env::var("NODE_ENV")
            .unwrap_or_else(|_| "development".to_string())
            .as_str()
        {
            "production" => Environment::Production,
            "test" => Environment::Test,
            _ => Environment::Development,
        };

        let config = Config {
            host: env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "9005".to_string())
                .parse()
                .unwrap_or(9005),
            database_url: env::var("DATABASE_URL")
                .or_else(|_| {
                    let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());
                    let port = env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string());
                    let name = env::var("DB_NAME").unwrap_or_else(|_| "xiaoxiao_dushulang".to_string());
                    let user = env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string());
                    let pass = env::var("DB_PASS").unwrap_or_else(|_| "".to_string());
                    Ok(format!("postgres://{}:{}@{}:{}/{}", user, pass, host, port, name))
                })?,
            redis_url: env::var("REDIS_URL")
                .or_else(|_| {
                    let host = env::var("REDIS_HOST").unwrap_or_else(|_| "localhost".to_string());
                    let port = env::var("REDIS_PORT").unwrap_or_else(|_| "6379".to_string());
                    Ok(format!("redis://{}:{}", host, port))
                })?,
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "xiaoxiao-jwt-secret".to_string()),
            session_secret: env::var("SESSION_SECRET")
                .unwrap_or_else(|_| "xiaoxiao-session-secret".to_string()),
            log_level: env::var("RUST_LOG")
                .unwrap_or_else(|_| {
                    match environment {
                        Environment::Development => "debug".to_string(),
                        Environment::Production => "info".to_string(),
                        Environment::Test => "warn".to_string(),
                    }
                }),
            cors_origins: env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000,http://localhost:8080".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            environment,
        };

        Ok(config)
    }

    pub fn is_development(&self) -> bool {
        self.environment == Environment::Development
    }

    pub fn is_production(&self) -> bool {
        self.environment == Environment::Production
    }

    pub fn is_test(&self) -> bool {
        self.environment == Environment::Test
    }
}