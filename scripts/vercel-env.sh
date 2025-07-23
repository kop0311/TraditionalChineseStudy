#!/bin/bash

# Vercel 环境变量配置脚本
# 独立的环境变量配置工具

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 环境变量配置
configure_env_vars() {
    log_info "配置 Vercel 环境变量..."
    
    # Supabase 配置
    log_info "设置 Supabase 数据库配置..."
    echo "https://tvufiqqsrankufybqmbz.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force
    echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWZpcXFzcmFua3VmeWJxbWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDcwNzYsImV4cCI6MjA2ODgyMzA3Nn0.RVaSELCwqBGH8jpfNcVNWwGdDu2CsCMSno5KNviFbG4" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force
    echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWZpcXFzcmFua3VmeWJxbWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI0NzA3NiwiZXhwIjoyMDY4ODIzMDc2fQ.MsMxjRsGSFKKk12jTTon989DsTKYGMXD8-9wIjhRDWg" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --force
    
    # CDN 配置
    log_info "设置 CDN 配置..."
    echo "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" | vercel env add CDN_BOOTSTRAP production --force
    echo "https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js" | vercel env add CDN_HANZI production --force
    echo "https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" | vercel env add CDN_TINYMCE production --force
    
    # 应用配置
    log_info "设置应用配置..."
    echo "production" | vercel env add NODE_ENV production --force
    echo "1" | vercel env add NEXT_TELEMETRY_DISABLED production --force
    echo "warn" | vercel env add LOG_LEVEL production --force
    
    # 速率限制配置
    log_info "设置速率限制配置..."
    echo "900000" | vercel env add RATE_LIMIT_WINDOW_MS production --force
    echo "1000" | vercel env add RATE_LIMIT_MAX_REQUESTS production --force
    echo "5" | vercel env add AUTH_RATE_LIMIT_MAX production --force
    echo "100" | vercel env add API_RATE_LIMIT_MAX production --force
    
    # 文件上传配置
    log_info "设置文件上传配置..."
    echo "2097152" | vercel env add UPLOAD_MAX_SIZE production --force
    echo "jpg,jpeg,png,gif" | vercel env add UPLOAD_ALLOWED_TYPES production --force
    
    log_success "所有环境变量配置完成！"
}

# 显示环境变量
show_env_vars() {
    log_info "当前环境变量:"
    vercel env ls
}

# 主函数
main() {
    echo ""
    log_info "🔧 Vercel 环境变量配置工具"
    echo "==============================="
    echo ""
    
    case "${1:-setup}" in
        "setup")
            configure_env_vars
            ;;
        "list")
            show_env_vars
            ;;
        "help")
            echo "用法:"
            echo "  $0 setup  - 配置所有环境变量"
            echo "  $0 list   - 显示当前环境变量"
            echo "  $0 help   - 显示帮助信息"
            ;;
        *)
            log_error "未知选项: $1"
            echo "运行 '$0 help' 查看用法"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "✅ 完成！"
}

main "$@"