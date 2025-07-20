# 小小读书郎 Docker 命名规范

## 项目标识
- **项目代码**: `xxdsl` (xiaoxiao-dushulang)
- **项目全名**: `xiaoxiao-dushulang`
- **应用名称**: 小小读书郎

## 命名规范

### 容器命名规范
格式: `{项目代码}-{服务类型}-{环境}`

**示例:**
- `xxdsl-mysql-dev` - MySQL数据库开发环境
- `xxdsl-app-dev` - Node.js应用开发环境
- `xxdsl-redis-dev` - Redis缓存开发环境 (如需要)
- `xxdsl-nginx-dev` - Nginx代理开发环境 (如需要)

### 数据卷命名规范
格式: `{项目代码}_{服务类型}_data_{环境}`

**示例:**
- `xxdsl_mysql_data_dev` - MySQL数据存储卷
- `xxdsl_app_uploads_dev` - 应用文件上传卷
- `xxdsl_app_logs_dev` - 应用日志卷

### 网络命名规范
格式: `{项目代码}-network-{环境}`

**示例:**
- `xxdsl-network-dev` - 开发环境网络

### 镜像命名规范
格式: `{项目代码}-{组件}:{版本标签}`

**示例:**
- `xxdsl-app:latest` - 应用镜像最新版
- `xxdsl-app:v1.0.0` - 应用镜像版本1.0.0
- `xxdsl-app:dev` - 开发版本镜像

## 端口分配规范

### 开发环境端口
- **主应用**: 9000 (来自.env配置)
- **MySQL**: 3308 (避免与其他项目冲突)
- **Redis**: 6380 (如需要)
- **PHPMyAdmin**: 8090 (如需要)

## 环境变量规范

### 数据库连接
```
DB_HOST=localhost
DB_PORT=3308
DB_USER=root
DB_PASS=rootpassword
DB_NAME=xiaoxiao_dushulang
```

## 标签和元数据规范

### 容器标签
```bash
--label project=xiaoxiao-dushulang
--label environment=development
--label service=mysql
--label version=1.0.0
--label maintainer=developer
```

## 文件和目录规范

### Docker相关文件
- `docker-compose.yml` - 主要编排文件
- `docker-compose.dev.yml` - 开发环境覆盖
- `docker-compose.prod.yml` - 生产环境覆盖
- `Dockerfile` - 应用镜像构建文件
- `.dockerignore` - Docker忽略文件
- `docker/` - Docker相关脚本和配置目录

### 脚本命名
- `docker-start.sh` - 启动脚本
- `docker-stop.sh` - 停止脚本
- `docker-rebuild.sh` - 重建脚本
- `docker-logs.sh` - 日志查看脚本
- `docker-backup.sh` - 数据备份脚本

## 完整示例配置

### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: xxdsl-mysql-dev
    restart: unless-stopped
    ports:
      - "3308:3306"
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: xiaoxiao_dushulang
      MYSQL_USER: xxdsl_user
      MYSQL_PASSWORD: xxdsl_password
    volumes:
      - xxdsl_mysql_data_dev:/var/lib/mysql
    networks:
      - xxdsl-network-dev
    labels:
      - "project=xiaoxiao-dushulang"
      - "environment=development"
      - "service=mysql"

  app:
    build: .
    image: xxdsl-app:dev
    container_name: xxdsl-app-dev
    restart: unless-stopped
    ports:
      - "9000:9000"
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: xxdsl_user
      DB_PASS: xxdsl_password
      DB_NAME: xiaoxiao_dushulang
    volumes:
      - .:/app
      - xxdsl_app_logs_dev:/app/logs
    networks:
      - xxdsl-network-dev
    depends_on:
      - mysql
    labels:
      - "project=xiaoxiao-dushulang"
      - "environment=development"
      - "service=app"

volumes:
  xxdsl_mysql_data_dev:
    driver: local
    labels:
      - "project=xiaoxiao-dushulang"
      - "environment=development"
      - "service=mysql"
  
  xxdsl_app_logs_dev:
    driver: local
    labels:
      - "project=xiaoxiao-dushulang"
      - "environment=development"
      - "service=app"

networks:
  xxdsl-network-dev:
    driver: bridge
    labels:
      - "project=xiaoxiao-dushulang"
      - "environment=development"
```

## 管理命令

### 查看项目相关资源
```bash
# 查看项目容器
docker ps -a --filter label=project=xiaoxiao-dushulang

# 查看项目卷
docker volume ls --filter label=project=xiaoxiao-dushulang

# 查看项目网络
docker network ls --filter label=project=xiaoxiao-dushulang

# 查看项目镜像
docker images xxdsl-*
```

### 清理命令
```bash
# 停止所有项目容器
docker stop $(docker ps -q --filter label=project=xiaoxiao-dushulang)

# 删除所有项目容器
docker rm $(docker ps -aq --filter label=project=xiaoxiao-dushulang)

# 删除项目镜像
docker rmi $(docker images xxdsl-* -q)

# 删除项目卷 (谨慎使用)
docker volume rm $(docker volume ls -q --filter label=project=xiaoxiao-dushulang)
```

## 备份和恢复

### 数据备份
```bash
# 备份MySQL数据
docker run --rm \
  -v xxdsl_mysql_data_dev:/source \
  -v $(pwd)/backups:/backup \
  --name xxdsl-backup-temp \
  busybox tar czf /backup/xxdsl-mysql-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
```

### 数据恢复
```bash
# 恢复MySQL数据
docker run --rm \
  -v xxdsl_mysql_data_dev:/target \
  -v $(pwd)/backups:/backup \
  --name xxdsl-restore-temp \
  busybox tar xzf /backup/xxdsl-mysql-20250718-120000.tar.gz -C /target
```