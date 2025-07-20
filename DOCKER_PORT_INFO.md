# Docker 端口配置信息

## 前端调试端口
- **固定端口**: `9005`
- **访问地址**: http://localhost:9005
- **热重载**: ✅ 支持，端口不会变动
- **字源功能**: http://localhost:9005/etymology

## 数据库端口
- **MySQL端口**: `3308`
- **访问地址**: localhost:3308
- **数据库名**: xiaoxiao_dushulang

## 启动命令
```bash
# 启动开发环境
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 清理资源
docker-compose down && docker system prune -f
```

## 清理状态
✅ **已清理完成** (2025-07-18)
- 移除了所有旧项目的 Docker 资源
- 移除了重复的容器和镜像
- 清理了未使用的 volumes 和 networks
- 固定前端调试端口为 9005

## 注意事项
- 端口 9005 已固定，不会因为重启而改变
- 支持热重载，代码修改会自动反映到浏览器
- 数据库数据持久化保存在 Docker volume 中
- 新增字源功能已部署并可用