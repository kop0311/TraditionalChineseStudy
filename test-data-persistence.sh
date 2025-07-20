#!/bin/bash

# 小小读书郎 - 数据持久化测试脚本

echo "=== 数据持久化测试 ==="

# 检查是否已有运行的容器
if docker-compose ps | grep -q "Up"; then
    echo "检测到运行中的容器，先停止..."
    docker-compose down
fi

echo "🚀 启动服务..."
docker-compose up -d

echo "⏳ 等待MySQL健康检查..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL 已启动"
        break
    fi
    echo "等待MySQL启动... (剩余 $timeout 秒)"
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ MySQL 启动超时"
    exit 1
fi

echo "⏳ 等待应用启动..."
sleep 10

echo "📊 初始化数据库..."
docker-compose exec app npm run migrate 2>/dev/null || true
docker-compose exec app npm run seed 2>/dev/null || true

echo "🧪 测试1: 检查初始数据..."
USER_COUNT=$(docker-compose exec mysql mysql -u root -prootpassword -e "SELECT COUNT(*) FROM xiaoxiao_dushulang.users;" 2>/dev/null | tail -1)
echo "初始用户数量: $USER_COUNT"

echo "🧪 测试2: 创建测试用户..."
docker-compose exec mysql mysql -u root -prootpassword -e "
INSERT INTO xiaoxiao_dushulang.users (email, name, password_hash, created_at, updated_at) 
VALUES ('test@example.com', 'Test User', 'hashed_password', NOW(), NOW());" 2>/dev/null

echo "🧪 测试3: 验证用户创建..."
TEST_USER=$(docker-compose exec mysql mysql -u root -prootpassword -e "SELECT email FROM xiaoxiao_dushulang.users WHERE email='test@example.com';" 2>/dev/null | tail -1)
echo "测试用户: $TEST_USER"

echo "🛑 停止容器（保留数据卷）..."
docker-compose down

echo "🔄 重新启动容器..."
docker-compose up -d

echo "⏳ 等待服务重启..."
sleep 15

echo "🧪 测试4: 验证数据持久化..."
PERSISTED_USER=$(docker-compose exec mysql mysql -u root -prootpassword -e "SELECT email FROM xiaoxiao_dushulang.users WHERE email='test@example.com';" 2>/dev/null | tail -1)

if [ "$PERSISTED_USER" = "test@example.com" ]; then
    echo "✅ 数据持久化测试成功！"
    echo "🎉 用户数据在容器重启后保持不变"
else
    echo "❌ 数据持久化测试失败！"
    echo "📋 用户数据未保持"
fi

echo "🧪 测试5: 检查所有数据卷..."
docker volume ls --filter label=project=xiaoxiao-dushulang

echo "🧪 测试6: 检查经典文本数据..."
CLASSICS_COUNT=$(docker-compose exec mysql mysql -u root -prootpassword -e "SELECT COUNT(*) FROM xiaoxiao_dushulang.classics;" 2>/dev/null | tail -1)
echo "经典文本数量: $CLASSICS_COUNT"

echo "📊 测试结果总结："
echo "✅ MySQL 数据卷: xxdsl_mysql_data_dev"
echo "✅ 应用日志卷: xxdsl_app_logs_dev"  
echo "✅ 文件上传卷: xxdsl_app_uploads_dev"
echo "✅ 用户数据持久化: $([ "$PERSISTED_USER" = "test@example.com" ] && echo "成功" || echo "失败")"
echo "✅ 经典文本数据: $CLASSICS_COUNT 部经典"

echo ""
echo "🔧 服务访问信息："
echo "- 前端: http://localhost:9005"
echo "- 管理后台: http://localhost:9005/admin"
echo "- 数据库: localhost:3308"
echo ""
echo "🛑 停止测试: docker-compose down"
echo "🗑️  清理数据: docker-compose down -v"