# 小小读书郎 - 快速启动指南

## 🚀 快速开始

### 方式一：Docker 一键启动（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/kop0311/TraditionalChineseStudy.git
cd TraditionalChineseStudy

# 2. 启动所有服务
docker-compose up -d

# 3. 访问应用
open http://localhost
```

### 方式二：本地开发环境

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 启动开发服务器
npm run dev:full

# 4. 访问应用
# Next.js 前端: http://localhost:3000
# Express 后端: http://localhost:9005
```

### 方式三：使用部署脚本

```bash
# 开发环境部署
./scripts/deploy-modern.sh development

# 生产环境部署
./scripts/deploy-modern.sh production
```

## 📋 系统要求

### 最低要求
- **Node.js**: 20.0.0+
- **Docker**: 20.10.0+
- **Docker Compose**: 2.0.0+
- **内存**: 2GB+
- **磁盘**: 5GB+

### 推荐配置
- **Node.js**: 20.x LTS
- **Docker**: 最新稳定版
- **内存**: 4GB+
- **磁盘**: 10GB+

## 🔧 环境配置

### 环境变量说明

```bash
# 应用配置
NODE_ENV=development          # 环境模式
PORT=9005                    # Express 端口
NEXT_PORT=3000              # Next.js 端口

# 数据库配置
DB_HOST=localhost           # 数据库主机
DB_PORT=3306               # 数据库端口
DB_USER=xxdsl_user         # 数据库用户
DB_PASS=xxdsl_password     # 数据库密码
DB_NAME=xiaoxiao_dushulang # 数据库名称

# 安全配置
SESSION_SECRET=your-secret-key  # 会话密钥
ADMIN_PASS=123456              # 管理员密码
```

### Docker 环境变量

```bash
# Docker 开发环境
DB_HOST=mysql              # 使用 Docker 服务名
REDIS_HOST=redis          # Redis 服务名
```

## 🌐 访问地址

### 开发环境
| 服务 | 地址 | 说明 |
|------|------|------|
| 主应用 | http://localhost | Caddy 反向代理 |
| Next.js | http://localhost:3000 | 前端应用 |
| Express | http://localhost:9005 | 后端 API |
| Caddy 管理 | http://localhost:2019 | 服务器管理 |
| 监控指标 | http://localhost:2020/metrics | Prometheus 指标 |

### 生产环境
| 服务 | 地址 | 说明 |
|------|------|------|
| 主应用 | http://localhost | Caddy 反向代理 |
| Next.js | http://localhost:3001 | 前端应用 |
| Express | http://localhost:9006 | 后端 API |

## 📱 功能模块

### 🏠 首页
- 应用介绍和导航
- 学习统计展示
- 快速入口

### 📚 经典阅读
- **三字经**: 传统启蒙教材
- **弟子规**: 行为规范指导
- **道德经**: 哲学思想经典

### ✍️ 汉字练习
- 交互式笔画练习
- 正确笔顺演示
- 书写评分系统

### 🔤 拼音练习
- 声调识别训练
- 发音练习
- 拼音标注学习

## 🛠️ 开发命令

### 基础命令
```bash
# 安装依赖
npm install

# 开发模式
npm run dev              # Express 服务器
npm run dev:next         # Next.js 服务器
npm run dev:full         # 同时启动两个服务器

# 构建
npm run build            # 完整构建
npm run build:next       # 构建 Next.js
npm run build:backend    # 构建后端

# 测试
npm test                 # 运行所有测试
npm run test:watch       # 监视模式测试
npm run test:coverage    # 测试覆盖率
npm run test:nextjs      # Next.js 测试
npm run test:components  # 组件测试
```

### Docker 命令
```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重建镜像
docker-compose build --no-cache

# 查看服务状态
docker-compose ps
```

## 🔍 故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口占用
lsof -i :3000
lsof -i :9005

# 修改端口配置
# 编辑 .env 文件中的 PORT 和 NEXT_PORT
```

#### 2. 数据库连接失败
```bash
# 检查 MySQL 服务
docker-compose ps mysql

# 查看数据库日志
docker-compose logs mysql

# 重启数据库
docker-compose restart mysql
```

#### 3. Next.js 构建失败
```bash
# 清理缓存
rm -rf .next
npm run build:next

# 检查依赖
npm ci
```

#### 4. Docker 内存不足
```bash
# 增加 Docker 内存限制
# Docker Desktop -> Settings -> Resources -> Memory
```

### 日志查看
```bash
# 应用日志
docker-compose logs app

# Next.js 日志
docker-compose logs nextjs

# Caddy 日志
docker-compose logs caddy

# 所有服务日志
docker-compose logs -f
```

## 📖 学习资源

### 技术文档
- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev)
- [Caddy 官方文档](https://caddyserver.com/docs)
- [Docker 官方文档](https://docs.docker.com)

### 项目文档
- [开发指南](./docs/development.md)
- [部署指南](./docs/deployment.md)
- [API 文档](./docs/api.md)
- [升级报告](./UPGRADE_COMPLETE.md)

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

### 代码规范
```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## 📞 获取帮助

### 技术支持
- **GitHub Issues**: 报告 Bug 和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **文档**: 查看项目文档

### 联系方式
- **项目地址**: https://github.com/kop0311/TraditionalChineseStudy
- **问题反馈**: 通过 GitHub Issues
- **功能建议**: 通过 GitHub Discussions

---

**快速启动指南版本**: v2.0.0  
**最后更新**: 2024年7月20日
