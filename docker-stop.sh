#!/bin/bash

# 小小读书郎 项目停止脚本

echo "=== 停止 小小读书郎 项目 ==="

# 停止Docker Compose服务
echo "1. 停止Docker Compose服务..."
docker-compose down

# 显示剩余的项目容器（如果有）
echo "2. 检查剩余的项目容器..."
REMAINING=$(docker ps -q --filter label=project=xiaoxiao-dushulang)
if [ ! -z "$REMAINING" ]; then
    echo "   发现剩余容器，正在停止..."
    docker stop $REMAINING
    echo "   ✓ 所有容器已停止"
else
    echo "   ✓ 没有运行中的项目容器"
fi

echo "=== 停止完成 ==="
echo ""
echo "项目资源状态:"
echo "  容器: $(docker ps -a --filter label=project=xiaoxiao-dushulang --format 'table {{.Names}}	{{.Status}}' | tail -n +2 | wc -l) 个"
echo "  数据卷: $(docker volume ls --filter label=project=xiaoxiao-dushulang -q | wc -l) 个"
echo ""
echo "重新启动: ./docker-start.sh 或 docker-compose up -d"