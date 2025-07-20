#!/bin/bash

# 小小读书郎 - Docker数据管理脚本

echo "=== 小小读书郎 Docker 数据管理 ==="

case "$1" in
    "backup")
        echo "📦 备份数据..."
        mkdir -p ./backups
        
        # 备份MySQL数据
        echo "备份MySQL数据..."
        docker run --rm \
            -v xxdsl_mysql_data_dev:/source:ro \
            -v $(pwd)/backups:/backup \
            --name xxdsl-backup-temp \
            busybox tar czf /backup/mysql-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
        
        # 备份应用日志
        echo "备份应用日志..."
        docker run --rm \
            -v xxdsl_app_logs_dev:/source:ro \
            -v $(pwd)/backups:/backup \
            --name xxdsl-logs-backup-temp \
            busybox tar czf /backup/logs-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
        
        # 备份上传文件
        echo "备份上传文件..."
        docker run --rm \
            -v xxdsl_app_uploads_dev:/source:ro \
            -v $(pwd)/backups:/backup \
            --name xxdsl-uploads-backup-temp \
            busybox tar czf /backup/uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
        
        echo "✅ 备份完成，文件保存在 ./backups 目录"
        ;;
    
    "restore")
        if [ -z "$2" ]; then
            echo "❌ 请指定要恢复的备份文件"
            echo "用法: $0 restore <backup-file>"
            exit 1
        fi
        
        echo "📦 恢复数据..."
        echo "警告：这将覆盖现有数据！"
        read -p "确定要继续吗？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "取消恢复操作"
            exit 0
        fi
        
        # 恢复MySQL数据
        docker run --rm \
            -v xxdsl_mysql_data_dev:/target \
            -v $(pwd)/backups:/backup \
            --name xxdsl-restore-temp \
            busybox tar xzf /backup/$2 -C /target
        
        echo "✅ 数据恢复完成"
        ;;
    
    "reset")
        echo "🗑️  重置所有数据..."
        echo "警告：这将删除所有用户数据！"
        read -p "确定要继续吗？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "取消重置操作"
            exit 0
        fi
        
        # 停止服务
        docker-compose down
        
        # 删除所有卷
        docker volume rm xxdsl_mysql_data_dev xxdsl_app_logs_dev xxdsl_app_uploads_dev 2>/dev/null || true
        
        echo "✅ 数据重置完成"
        echo "💡 下次启动时将创建全新的数据库"
        ;;
    
    "status")
        echo "📊 数据卷状态："
        docker volume ls --filter label=project=xiaoxiao-dushulang
        
        echo ""
        echo "📦 数据卷详情："
        docker volume inspect xxdsl_mysql_data_dev xxdsl_app_logs_dev xxdsl_app_uploads_dev 2>/dev/null || echo "某些卷不存在"
        
        echo ""
        echo "💾 磁盘使用情况："
        docker system df
        ;;
    
    *)
        echo "用法: $0 {backup|restore|reset|status}"
        echo ""
        echo "命令说明："
        echo "  backup  - 备份所有数据卷"
        echo "  restore - 恢复指定备份文件"
        echo "  reset   - 重置所有数据（危险操作）"
        echo "  status  - 查看数据卷状态"
        echo ""
        echo "示例："
        echo "  $0 backup"
        echo "  $0 restore mysql-backup-20250118-120000.tar.gz"
        echo "  $0 status"
        ;;
esac