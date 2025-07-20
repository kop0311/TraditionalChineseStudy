#!/bin/bash

# 小小读书郎 - 完整Docker启动脚本
# 包含数据库和应用服务

echo "=== 小小读书郎 Docker 完整启动 ==="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查docker-compose是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

echo "✅ Docker 环境检查通过"

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动所有服务
echo "🚀 构建并启动服务..."
docker-compose up -d --build

# 等待MySQL健康检查通过
echo "⏳ 等待MySQL启动..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL 已启动"
        break
    fi
    echo "等待MySQL启动... (剩余 $timeout 秒)"
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ MySQL 启动超时"
    docker-compose logs mysql
    exit 1
fi

# 等待5秒让应用完全启动
echo "⏳ 等待应用启动..."
sleep 5

# 初始化数据库（如果是首次启动）
echo "📊 初始化数据库..."
docker-compose exec app npm run migrate
docker-compose exec app npm run seed

# 检查服务状态
echo "📋 检查服务状态..."
docker-compose ps

# 显示访问信息
echo ""
echo "🎉 启动完成！"
echo "📱 前端网站: http://localhost:9000"
echo "🔧 管理后台: http://localhost:9000/admin"
echo "🗄️  数据库: localhost:3308"
echo "👤 默认管理员: admin@local / 123456"
echo ""
echo "📝 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo "🔄 重启服务: docker-compose restart"
echo ""
echo "💾 数据持久化："
echo "   - MySQL数据: xxdsl_mysql_data_dev"
echo "   - 应用日志: xxdsl_app_logs_dev"
echo "   - 上传文件: xxdsl_app_uploads_dev"
echo "   用户数据将在容器重启后保持不变"