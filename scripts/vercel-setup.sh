#!/bin/bash

# Vercel 自动化部署脚本
# Traditional Chinese Study App - Vercel Setup Script

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Vercel CLI 是否安装
check_vercel_cli() {
    log_info "检查 Vercel CLI..."
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI 未安装. 请运行: npm i -g vercel"
        exit 1
    fi
    log_success "Vercel CLI 已安装: $(vercel --version)"
}

# 检查当前目录是否是项目根目录
check_project_root() {
    if [[ ! -f "package.json" ]] || [[ ! -f "next.config.js" ]]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    log_success "项目根目录确认"
}

# 登录 Vercel
login_vercel() {
    log_info "检查 Vercel 登录状态..."
    if ! vercel whoami &> /dev/null; then
        log_info "需要登录 Vercel..."
        vercel login
    else
        log_success "已登录 Vercel: $(vercel whoami)"
    fi
}

# 配置环境变量
setup_env_vars() {
    log_info "配置环境变量..."
    
    # 检查是否存在 .env.production 文件
    if [[ ! -f ".env.production" ]]; then
        log_error ".env.production 文件不存在"
        exit 1
    fi
    
    log_info "从 .env.production 读取环境变量..."
    
    # 读取环境变量并设置到 Vercel
    while IFS='=' read -r key value; do
        # 跳过注释和空行
        if [[ $key =~ ^#.*$ ]] || [[ -z "$key" ]]; then
            continue
        fi
        
        # 移除可能的引号
        value=$(echo "$value" | sed 's/^"//; s/"$//')
        
        log_info "设置环境变量: $key"
        echo "$value" | vercel env add "$key" production --force > /dev/null 2>&1 || true
        
    done < ".env.production"
    
    log_success "环境变量配置完成"
}

# 部署到 Vercel
deploy_to_vercel() {
    log_info "开始部署到 Vercel..."
    
    # 检查是否已链接项目
    if [[ ! -f ".vercel/project.json" ]]; then
        log_info "首次部署，需要链接项目..."
        vercel --prod
    else
        log_info "部署到生产环境..."
        vercel --prod
    fi
    
    log_success "部署完成！"
}

# 显示部署信息
show_deployment_info() {
    log_info "获取部署信息..."
    
    # 获取项目URL
    PROJECT_URL=$(vercel ls --meta | grep "traditional-chinese-study" | head -1 | awk '{print $2}' || echo "")
    
    if [[ -n "$PROJECT_URL" ]]; then
        log_success "应用部署成功！"
        echo ""
        echo "🚀 应用地址: https://$PROJECT_URL"
        echo "📊 健康检查: https://$PROJECT_URL/api/health"
        echo "📚 经典作品: https://$PROJECT_URL/api/classics"
        echo "🎯 数据库测试: https://$PROJECT_URL/api/test-db"
        echo ""
        log_info "您可以在 Vercel Dashboard 查看详细信息: https://vercel.com/dashboard"
    else
        log_warning "无法获取部署URL，请检查 Vercel Dashboard"
    fi
}

# 主函数
main() {
    echo ""
    log_info "🚀 Traditional Chinese Study - Vercel 自动化部署"
    echo "=================================================="
    echo ""
    
    # 执行部署流程
    check_vercel_cli
    check_project_root
    login_vercel
    setup_env_vars
    deploy_to_vercel
    show_deployment_info
    
    echo ""
    log_success "✅ 部署完成！"
    echo ""
}

# 运行主函数
main "$@"