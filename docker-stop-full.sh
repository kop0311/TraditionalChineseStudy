#!/bin/bash

# 小小读书郎 - 完整Docker停止脚本

echo "=== 小小读书郎 Docker 停止服务 ==="

# 停止所有服务
echo "🛑 停止所有服务..."
docker-compose down

# 显示卷信息
echo ""
echo "💾 数据持久化卷状态："
docker volume ls --filter label=project=xiaoxiao-dushulang

echo ""
echo "✅ 服务已停止"
echo "💡 数据已保存在Docker卷中，下次启动时会自动恢复"
echo ""
echo "🔄 重新启动: ./docker-start-full.sh"
echo "🗑️  删除所有数据: docker-compose down -v"