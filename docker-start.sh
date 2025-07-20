#!/bin/bash

# 小小读书郎 项目启动脚本
# 使用规范化Docker容器和卷命名

echo "=== 小小读书郎 项目启动 ==="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 创建项目网络（如果不存在）
echo "1. 创建项目网络..."
docker network create xxdsl-network-dev --label project=xiaoxiao-dushulang --label environment=development 2>/dev/null || echo "网络已存在"

# 启动MySQL数据库
echo "2. 启动MySQL数据库..."
docker-compose up -d mysql

# 等待数据库启动
echo "3. 等待数据库启动..."
echo "   检查数据库健康状态..."
for i in {1..30}; do
    if docker exec xxdsl-mysql-dev mysqladmin ping -h localhost --silent; then
        echo "   数据库已就绪"
        break
    fi
    echo "   等待中... ($i/30)"
    sleep 2
done

# 检查数据库连接
echo "4. 验证数据库连接..."
if docker exec xxdsl-mysql-dev mysqladmin ping -h localhost --silent; then
    echo "   ✓ 数据库连接成功"
else
    echo "   ✗ 数据库连接失败"
    echo "   查看数据库日志:"
    docker logs xxdsl-mysql-dev --tail 20
    exit 1
fi

# 运行数据库迁移和种子数据
echo "5. 运行数据库迁移和种子数据..."
if [ -f "package.json" ]; then
    echo "   执行: npm run setup"
    npm run setup
    if [ $? -eq 0 ]; then
        echo "   ✓ 数据库初始化完成"
    else
        echo "   ⚠ 数据库初始化可能有问题，但继续启动应用"
    fi
else
    echo "   ⚠ 未找到package.json，跳过数据库初始化"
fi

# 启动Node.js应用
echo "6. 启动Node.js应用..."
echo "   执行: npm run dev"
npm run dev

echo "=== 启动完成 ==="
echo "应用地址: http://localhost:9000"
echo "数据库端口: localhost:3308"
echo ""
echo "管理命令:"
echo "  查看容器状态: docker ps --filter label=project=xiaoxiao-dushulang"
echo "  查看数据库日志: docker logs xxdsl-mysql-dev"
echo "  停止服务: docker-compose down"
