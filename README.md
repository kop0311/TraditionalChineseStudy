

# 小小读书郎 - 儿童中文经典学习平台

## 项目简介

一个现代化的儿童中文经典学习平台，采用 Next.js React 架构，让海外儿童通过《道德经》《三字经》《弟子规》等经典文本逐字学中文，支持笔顺动画、拼音标注和汉字故事。

## 🌟 功能特色

- 📚 **经典文本**: 精选《道德经》《三字经》《弟子规》，简繁对照，拼音标注
- ✍️ **笔顺动画**: 点击任意汉字观看标准笔顺动画
- 📖 **汉字故事**: 每个汉字都有有趣的故事，帮助理解含义
- 🎬 **视频嵌入**: 支持 YouTube 视频懒加载
- 📱 **响应式设计**: 完美支持手机、平板、电脑
- 🔧 **管理后台**: 内容管理系统，可编辑汉字故事

## 🚀 技术架构 (现代化 Rust + Next.js)

### 前端技术栈
- **Framework**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Modules
- **UI组件**: 自定义中式设计组件库
- **动画**: Framer Motion

### 后端技术栈
- **主要后端**: Rust + Warp (高性能异步 API)
- **数据库**: PostgreSQL 15 + SQLx (类型安全)
- **缓存**: Redis 7 (异步连接)
- **认证**: JWT + bcrypt (Rust 实现)
- **序列化**: Serde (JSON 处理)

### 基础设施
- **包管理器**: Bun 1.2.19 (前端) + Cargo (Rust 后端)
- **容器化**: Docker + Docker Compose
- **反向代理**: Caddy
- **开发工具**: TypeScript, ESLint, Prettier, Rust analyzer
- **测试**: Jest (前端) + Playwright (E2E)

## 📦 快速开始

### 环境要求

- **Bun 1.0+** (前端开发)
- **Rust 1.75+** (后端开发)
- Docker + Docker Compose (推荐)
- PostgreSQL 15+ (或使用 Docker)
- Redis 7+ (或使用 Docker)

### 🐳 使用 Docker (推荐)

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd TraditionalChineseStudy
   ```

2. **启动开发环境**
   ```bash
   # 启动所有服务 (Next.js + PostgreSQL + Redis + Caddy)
   docker-compose up -d
   
   # 查看服务状态
   docker-compose ps
   ```

3. **访问应用**
   - 前端应用: http://localhost:3000
   - API后端: http://localhost:9005 (仅管理功能)
   - Caddy管理: http://localhost:2019
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### 💻 本地开发

1. **安装 Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **安装依赖**
   ```bash
   bun install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接信息
   ```

4. **初始化数据库**
   ```bash
   # 创建数据库和表结构
   npm run migrate
   
   # 导入示例数据
   npm run seed
   ```

5. **启动服务器**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

6. **访问应用**
   - 前端网站: http://localhost:3000
   - 管理后台: http://localhost:3000/admin
   - 默认管理员账号: admin@local / 123456

## 部署指南

### cPanel 共享主机部署

1. **上传代码**
   ```bash
   # 将项目打包上传到 ~/app 目录
   zip -r xiaoxiao-dushulang.zip . -x "node_modules/*" ".git/*"
   # 通过 cPanel 文件管理器上传并解压
   ```

2. **配置 Node.js 应用**
   - 进入 cPanel → "Setup Node.js App"
   - 选择 Node.js 版本 18.x
   - Application root: ~/app
   - 启动文件: app.js
   - 点击 "Run NPM Install"

3. **配置环境变量**
   ```bash
   # SSH 连接服务器，在 ~/app 目录下创建 .env 文件
   cd ~/app
   cp .env.example .env
   nano .env
   ```

4. **初始化数据库**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **配置 Apache 代理**
   - .htaccess 文件已在 /public 目录中
   - 确保 mod_rewrite 和 mod_proxy 已启用

6. **启动应用**
   ```bash
   pm2 start app.js --name xiaoxiao-dushulang
   # 或者
   node app.js &
   ```

7. **配置 Cron 任务**
   ```bash
   # 在 cPanel 中添加 Cron 任务（每10分钟执行一次）
   */10 * * * * /usr/bin/node ~/app/cron/keepalive.js >> ~/app/logs/keepalive.log 2>&1
   ```

### VPS 部署

1. **系统要求**
   ```bash
   # Ubuntu 20.04+ / CentOS 8+
   sudo apt update
   sudo apt install nodejs npm mysql-server nginx
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **配置 PM2**
   ```bash
   npm install -g pm2
   pm2 start app.js --name xiaoxiao-dushulang
   pm2 startup
   pm2 save
   ```

## API 文档

### 公开 API

#### 获取经典列表
```
GET /api/classics
```

#### 获取章节列表
```
GET /api/chapters/:classicSlug
```

#### 获取句子列表
```
GET /api/sentences/:chapterId
```

#### 获取汉字信息
```
GET /api/characters/:char
```

### 页面路由

- `/` - 首页
- `/classics` - 经典文本列表
- `/reader/:classicSlug/:chapterNo` - 阅读器页面
- `/admin` - 管理后台
- `/ping` - 健康检查

## 项目结构

```
/app
├── app.js                 # 主应用文件
├── package.json          # 项目配置
├── .env                  # 环境变量
├── routes/               # 路由文件
│   ├── api.js           # API 路由
│   ├── web.js           # 网页路由
│   └── admin.js         # 管理后台路由
├── models/               # Sequelize 模型
│   ├── index.js
│   ├── Classic.js
│   ├── Chapter.js
│   ├── Sentence.js
│   ├── Character.js
│   └── User.js
├── views/                # EJS 模板
│   ├── index.ejs
│   ├── reader.ejs
│   ├── classics.ejs
│   └── admin/
├── public/               # 静态文件
│   ├── css/
│   ├── js/
│   ├── images/
│   └── .htaccess
├── data/                 # 初始数据
│   ├── daodejing.json
│   ├── sanzijing.json
│   ├── dizigui.json
│   └── characters.json
├── scripts/              # 数据库脚本
│   ├── migrate.js
│   └── seed.js
├── cron/                 # 定时任务
│   └── keepalive.js
├── tests/                # 测试文件
└── logs/                 # 日志文件
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| DB_HOST | 数据库主机 | localhost |
| DB_USER | 数据库用户名 | root |
| DB_PASS | 数据库密码 | |
| DB_NAME | 数据库名称 | xiaoxiao_dushulang |
| ADMIN_PASS | 管理员密码 | 123456 |
| SESSION_SECRET | 会话密钥 | xiaoxiao-dushulang-secret |
| CDN_HANZI | 汉字书写库 CDN | jsdelivr |
| CDN_BOOTSTRAP | Bootstrap CDN | jsdelivr |

## 性能优化

- **静态文件缓存**: 1天缓存期
- **Gzip 压缩**: 压缩文本文件
- **懒加载**: YouTube 视频按需加载
- **数据库索引**: 关键字段建立索引
- **图片优化**: 使用适当格式和大小

## 安全措施

- **Helmet.js**: 设置安全响应头
- **参数化查询**: 防止 SQL 注入
- **XSS 防护**: 输入验证和输出转义
- **CSRF 保护**: 表单令牌验证
- **会话管理**: 安全的会话配置

## 监控与日志

- **Winston 日志**: 结构化日志记录
- **日志轮转**: 按日期自动轮转
- **健康检查**: /ping 端点监控
- **性能监控**: LCP 等关键指标

## 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查 MySQL 服务状态
   sudo systemctl status mysql
   
   # 检查数据库配置
   mysql -u root -p -e "SHOW DATABASES;"
   ```

2. **Node.js 进程被杀死**
   ```bash
   # 检查进程状态
   pm2 status
   
   # 查看日志
   pm2 logs xiaoxiao-dushulang
   
   # 重启应用
   pm2 restart xiaoxiao-dushulang
   ```

3. **静态文件不加载**
   - 检查 .htaccess 配置
   - 确认文件权限正确
   - 检查 Apache 模块是否启用

### 日志位置

- 应用日志: `./logs/app-YYYY-MM-DD.log`
- PM2 日志: `~/.pm2/logs/`
- Nginx 日志: `/var/log/nginx/`
- MySQL 日志: `/var/log/mysql/`

## 开发指南

### 添加新经典文本

1. 在 `data/` 目录创建新的 JSON 文件
2. 运行 `npm run seed` 导入数据
3. 更新路由和模板

### 添加新汉字

1. 更新 `data/characters.json`
2. 运行 `npm run seed`
3. 在管理后台编辑故事内容

### 测试

```bash
# 运行测试
npm test

# 代码检查
npm run lint
```

## 文档

详细文档请查看 `docs/` 目录：

- [快速开始指南](docs/QUICK_START.md) - 快速部署和开发指南
- [产品需求文档](docs/PRD.md) - 完整产品规格
- [设计系统](docs/DESIGN_SYSTEM.md) - UI/UX 设计规范
- [技术升级计划](docs/TECH_UPGRADE_PLAN.md) - 技术栈演进计划
- [数据库迁移指南](docs/MIGRATION_GUIDE.md) - MySQL 到 PostgreSQL 迁移

## 支持与反馈

如有问题或建议，请联系开发团队或提交 Issue。

## 许可证

MIT License