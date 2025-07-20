# 三系统端口占用总表
> 最后更新：2025-07-18  
> 说明：每套系统内部按「前端 → 后端 → 数据库 → 消息/缓存 → 调试/监控」由低到高排列，预留 100 端口缓冲带。  
> 若需扩容，直接在各自预留段内递增即可，切勿跨段。

## 1️⃣ KD Family（亲子教育系统）
| 角色           | 端口 | 备注                        |
|----------------|------|-----------------------------|
| Web 前端 (Next.js) | 8000 | 开发模式 `pnpm dev -- --port 8000` |
| 管理后台前端      | 8001 | 独立构建包，独立端口            |
| 后端 API (NestJS) | 8100 | REST + GraphQL 双协议           |
| WebSocket 实时推送 | 8101 | Socket.IO                     |
| PostgreSQL      | 8200 | 主库                         |
| Redis           | 8201 | 缓存 + 分布式锁                |
| MinIO (对象存储) | 8202 | S3 兼容                      |
| Jaeger 链路追踪  | 8300 | 调试专用，仅本地启用             |
| Prometheus      | 8301 | 指标                         |
| Grafana         | 8302 | 看板                         |
| **保留段**      | 8303-8399 | 未来微服务扩展                 |

---

## 2️⃣ Traditional Chinese Study（国学研习平台）
| 角色           | 端口 | 备注                        |
|----------------|------|-----------------------------|
| Web 前端 (Vue3)  | 9000 | Vite dev server               |
| 移动端 H5        | 9001 | 独立模板                      |
| 后端 API (Spring Boot) | 9100 | RESTful                      |
| WebSocket 朗诵房间 | 9101 | STOMP over WS                |
| MySQL 8         | 9200 | 主库 utf8mb4                  |
| Redis           | 9201 | 缓存 + 限流                   |
| Elasticsearch   | 9202 | 全文检索（诗词、古籍）          |
| Kibana          | 9300 | ES 控制台                     |
| SonarQube       | 9301 | 代码质量（仅本地）             |
| **保留段**      | 9302-9399 | 未来 AI 语音、OCR 等扩展        |

---

## 3️⃣ Garden Planner（花园规划工具）
| 角色           | 端口 | 备注                        |
|----------------|------|-----------------------------|
| Web 前端 (SvelteKit) | 10000 | 主应用                       |
| 3D 可视化模块     | 10001 | Three.js 独立服务              |
| 后端 API (FastAPI) | 10100 | Python 3.11                  |
| Plant-CV 图像识别 | 10101 | OpenCV gRPC 服务              |
| SQLite (dev)    | 10200 | 轻量级本地库（文件模式）         |
| PostgreSQL (prod) | 10201 | 生产切库                     |
| Redis           | 10202 | 任务队列（Celery）             |
| Flower (Celery 监控) | 10300 | 任务看板                      |
| pgAdmin         | 10301 | 本地数据库 GUI                |
| **保留段**      | 10302-10399 | 未来移动端、小程序、IoT 等扩展   |

---

## 🚦快速记忆口诀
- KD Family → 8xxx  
- TCS → 9xxx  
- Garden → 10xxx  

> 重启后若仍报端口占用，优先检查 Docker 残留或系统服务冲突（如系统自带 PostgreSQL 占 5432）。  
> 使用 `lsof -i :<port>` 或 `netstat -tulnp | grep <port>` 定位进程。