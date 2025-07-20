# 小小读书郎 Docker 启动文档

## 项目 Docker 配置（规范化命名）

### 规范化容器和卷信息

**主要容器:**
- `xxdsl-mysql-dev`: MySQL 8 数据库容器
  - 端口: 3308 (避免冲突)
  - 密码: rootpassword
  - 数据库: xiaoxiao_dushulang
  - 数据卷: `xxdsl_mysql_data_dev`
  - 标签: project=xiaoxiao-dushulang

- `xxdsl-app-dev`: Node.js 应用容器
  - 端口: 9005
  - 环境: development
  - 数据卷: `xxdsl_app_logs_dev`, `xxdsl_app_uploads_dev`

**数据卷:**
- `xxdsl_mysql_data_dev`: MySQL数据存储（用户数据持久化）
- `xxdsl_app_logs_dev`: 应用日志存储
- `xxdsl_app_uploads_dev`: 文件上传存储

**网络:**
- `xxdsl-network-dev`: 项目内部网络

## 🚀 快速启动

### 方式1: 使用完整Docker Compose（推荐）

```bash
# 启动所有服务（数据库 + 应用）
./docker-start-full.sh

# 或者手动启动
docker-compose up -d --build
```

### 方式2: 仅启动MySQL数据库

```bash
# 仅启动MySQL数据库
docker-compose up -d mysql

# 然后本地运行应用
npm run dev
```

### 方式3: 使用现有脚本

```bash
# 使用现有的启动脚本
./docker-start.sh
```

## 📊 数据持久化说明

### 用户数据保护

所有用户数据都存储在Docker卷中，确保：
- **用户名和密码**：保存在 `xxdsl_mysql_data_dev` 卷中
- **注册用户**：保存在 `xxdsl_mysql_data_dev` 卷中
- **学习进度**：保存在 `xxdsl_mysql_data_dev` 卷中
- **应用日志**：保存在 `xxdsl_app_logs_dev` 卷中
- **上传文件**：保存在 `xxdsl_app_uploads_dev` 卷中

### 数据持久化特性

✅ **容器重启后数据保持**  
✅ **系统重启后数据保持**  
✅ **Docker重启后数据保持**  
✅ **删除容器后数据保持**  

❌ **仅在删除卷时数据丢失**

## 💾 数据管理

### 备份数据

```bash
# 备份所有数据
./docker-data-management.sh backup

# 查看备份文件
ls -la backups/
```

### 恢复数据

```bash
# 恢复指定备份
./docker-data-management.sh restore mysql-backup-20250118-120000.tar.gz
```

### 查看数据卷状态

```bash
# 查看所有项目相关的卷
./docker-data-management.sh status

# 或者使用Docker命令
docker volume ls --filter label=project=xiaoxiao-dushulang
```

## 🛠️ 常用命令

### 启动和停止

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f mysql
docker-compose logs -f app

# 查看最近的日志
docker-compose logs --tail=50 app
```

### 数据库操作

```bash
# 连接到MySQL数据库
docker-compose exec mysql mysql -u xxdsl_user -p xiaoxiao_dushulang

# 或者使用root用户
docker-compose exec mysql mysql -u root -p

# 运行数据库迁移
docker-compose exec app npm run migrate

# 导入种子数据
docker-compose exec app npm run seed
```

## 🔧 配置说明

### 默认配置

| 服务 | 端口 | 用户名 | 密码 |
|------|------|--------|------|
| MySQL | 3308 | root | rootpassword |
| MySQL | 3308 | xxdsl_user | xxdsl_password |
| 应用 | 9005 | admin@local | 123456 |

### 环境变量

Docker Compose 会自动设置以下环境变量：

```env
NODE_ENV=development
DB_HOST=mysql
DB_PORT=3308
DB_USER=xxdsl_user
DB_PASS=xxdsl_password
DB_NAME=xiaoxiao_dushulang
SESSION_SECRET=xiaoxiao-dushulang-dev-secret-key
ADMIN_PASS=123456
```

## 🚨 故障排除

### 端口冲突

```bash
# 检查端口占用
netstat -an | grep 3308
netstat -an | grep 9005

# 修改端口（在docker-compose.yml中）
ports:
  - "3309:3306"  # 改为3309
```

### 数据库连接失败

```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 等待健康检查通过
docker-compose exec mysql mysqladmin ping -h localhost
```

### 应用启动失败

```bash
# 查看应用日志
docker-compose logs app

# 检查环境变量
docker-compose exec app env

# 重新构建镜像
docker-compose build --no-cache app
```

### 重置所有数据

```bash
# 危险操作：删除所有数据
./docker-data-management.sh reset

# 或者手动删除
docker-compose down -v
docker volume prune
```

## 📋 检查清单

启动前确认：
- [ ] Docker 已安装并运行
- [ ] docker-compose 已安装
- [ ] 端口 3308 和 9005 未被占用
- [ ] 有足够的磁盘空间（建议 2GB+）

启动后验证：
- [ ] 访问 http://localhost:9005 正常
- [ ] 管理后台 http://localhost:9005/admin 可访问
- [ ] 数据库连接正常（查看应用日志）
- [ ] 数据卷已创建并挂载

## 🎯 生产环境部署

生产环境建议：

1. **安全配置**
   ```bash
   # 修改默认密码
   MYSQL_ROOT_PASSWORD=your-strong-password
   ADMIN_PASS=your-admin-password
   ```

2. **性能优化**
   ```bash
   # 增加资源限制
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '0.5'
   ```

3. **备份策略**
   ```bash
   # 定期备份（cron job）
   0 2 * * * /path/to/docker-data-management.sh backup
   ```

## 📱 访问信息

服务启动成功后：

- **前端网站**: http://localhost:9005
- **管理后台**: http://localhost:9005/admin
- **数据库**: localhost:3308
- **健康检查**: http://localhost:9005/ping

默认账户：
- **管理员**: admin@local / 123456
- **数据库**: xxdsl_user / xxdsl_password

🎉 **用户数据现在完全持久化，重启容器不会丢失任何数据！**