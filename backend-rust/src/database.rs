use sqlx::{PgPool, Row};
use tracing::{info, error};
use anyhow::Result;

#[derive(Debug, Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn connect(database_url: &str) -> Result<Self> {
        info!("正在连接 PostgreSQL 数据库...");
        
        let pool = PgPool::connect(database_url).await?;
        
        // Test the connection
        let row: (i64,) = sqlx::query_as("SELECT 1")
            .fetch_one(&pool)
            .await?;
        
        info!("数据库连接测试成功，返回值: {}", row.0);
        
        Ok(Database { pool })
    }

    pub async fn migrate(&self) -> Result<()> {
        info!("开始运行数据库迁移...");
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&self.pool).await?;
        
        info!("数据库迁移完成");
        Ok(())
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    pub async fn health_check(&self) -> Result<bool> {
        match sqlx::query("SELECT 1").fetch_one(&self.pool).await {
            Ok(_) => Ok(true),
            Err(e) => {
                error!("数据库健康检查失败: {}", e);
                Ok(false)
            }
        }
    }
}