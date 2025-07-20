#!/bin/bash

# 小小读书郎 - 开发环境热重载启动脚本

echo "=== 小小读书郎 - 开发环境热重载启动 ==="

# 检查并停止现有容器
echo "🛑 检查并停止现有容器..."
if docker-compose ps | grep -q "Up"; then
    echo "停止现有容器..."
    docker-compose down
fi

# 启动开发环境
echo "🚀 启动开发环境（热重载模式）..."
docker-compose up -d --build

# 等待MySQL健康检查
echo "⏳ 等待MySQL启动..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL已启动"
        break
    fi
    echo "等待MySQL... (剩余 $timeout 秒)"
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ MySQL启动超时"
    exit 1
fi

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 初始化数据库
echo "📊 初始化数据库..."
docker-compose exec app npm run migrate 2>/dev/null || true
docker-compose exec app npm run seed 2>/dev/null || true

echo ""
echo "🎉 热重载开发环境启动成功！"
echo ""
echo "📱 访问信息："
echo "- 前端应用: http://localhost:9006"
echo "- 管理后台: http://localhost:9006/admin"
echo "- 数据库: localhost:3308"
echo ""
echo "🔥 热重载特性："
echo "- 修改代码后自动重启服务"
echo "- 修改EJS模板后自动刷新"
echo "- 修改CSS/JS后自动更新"
echo "- 数据库数据完全持久化"
echo ""
echo "🛠️ 开发命令："
echo "- 查看日志: docker-compose logs -f app"
echo "- 停止服务: docker-compose down"
echo "- 重启应用: docker-compose restart app"
echo ""
echo "✨ 现在可以修改代码，直接刷新浏览器查看变化！"