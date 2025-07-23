use std::net::SocketAddr;
use warp::Filter;
use tracing::{info, error};
use dotenv::dotenv;

mod config;
mod database;
mod models;
mod handlers;
mod middleware;
mod services;
mod errors;
mod utils;

use config::Config;
use database::Database;
use errors::AppError;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("启动小小读书郎 Rust 后端服务器...");

    // Load configuration
    let config = Config::from_env()?;
    info!("配置加载完成");

    // Initialize database
    let db = Database::connect(&config.database_url).await?;
    info!("数据库连接建立成功");

    // Run migrations
    db.migrate().await?;
    info!("数据库迁移完成");

    // Initialize Redis cache
    let redis_client = redis::Client::open(config.redis_url.clone())?;
    let redis_conn = redis_client.get_async_connection().await?;
    info!("Redis 缓存连接建立成功");

    // Create shared app state
    let app_state = handlers::AppState::new(db.clone(), redis_conn, config.clone());

    // Build routes
    let routes = build_routes(app_state).await;

    // Parse bind address
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("有效的地址格式");

    info!("服务器启动在 http://{}", addr);
    info!("小小读书郎 Rust API 服务器启动成功！");
    info!("API 地址: http://{}/api", addr);
    info!("健康检查: http://{}/health", addr);

    // Start the server
    warp::serve(routes)
        .run(addr)
        .await;

    Ok(())
}

async fn build_routes(
    state: handlers::AppState
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    // Health check route
    let health = warp::path("health")
        .and(warp::get())
        .and_then(handlers::health::health_check);

    // API routes
    let api_routes = warp::path("api")
        .and(
            // Classics routes
            handlers::classics::routes(state.clone())
                // Chapters routes
                .or(handlers::chapters::routes(state.clone()))
                // Sentences routes
                .or(handlers::sentences::routes(state.clone()))
                // Auth routes
                .or(handlers::auth::routes(state.clone()))
                // Character routes
                .or(handlers::characters::routes(state.clone()))
        );

    // Combine all routes
    let routes = health
        .or(api_routes)
        .with(middleware::cors::cors())
        .with(middleware::logging::log())
        .with(middleware::security::security_headers())
        .recover(errors::handle_rejection);

    routes
}