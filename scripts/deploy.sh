#!/bin/bash

# 一键部署脚本 - Traditional Chinese Study App
# 包含构建测试、代码推送和 Vercel 部署的完整流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 检查项目状态
check_project_status() {
    log_step "1/6 检查项目状态"
    
    if [[ ! -f "package.json" ]]; then
        log_error "未找到 package.json，请在项目根目录运行脚本"
        exit 1
    fi
    
    if [[ ! -f ".env.production" ]]; then
        log_error "未找到 .env.production 文件"
        exit 1
    fi
    
    log_success "项目状态检查通过"
}

# 本地构建测试
test_build() {
    log_step "2/6 本地构建测试"
    
    log_info "安装依赖..."
    bun install
    
    log_info "运行构建..."
    if bun next build; then
        log_success "构建测试通过 ✅"
    else
        log_error "构建失败，请检查错误信息"
        exit 1
    fi
    
    log_info "清理构建文件..."
    rm -rf .next
}

# Git 提交和推送
git_commit_push() {
    log_step "3/6 Git 提交和推送"
    
    # 检查是否有未提交的更改
    if [[ -n $(git status --porcelain) ]]; then
        log_info "发现未提交的更改，正在提交..."
        
        git add .
        
        # 生成提交消息
        COMMIT_MSG="deploy: 准备 Vercel 部署

包含更新：
- 验证构建配置
- 确保环境变量正确
- 准备生产部署

🚀 Generated with deployment script

$(date '+%Y-%m-%d %H:%M:%S')"

        git commit -m "$COMMIT_MSG"
        log_success "代码已提交"
    else
        log_info "没有未提交的更改"
    fi
    
    log_info "推送到远程仓库..."
    git push origin main
    log_success "代码已推送到 GitHub"
}

# Vercel 环境检查
check_vercel_env() {
    log_step "4/6 Vercel 环境检查"
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI 未安装，请运行: npm i -g vercel"
        exit 1
    fi
    
    if ! vercel whoami &> /dev/null; then
        log_info "需要登录 Vercel..."
        vercel login
    fi
    
    log_success "Vercel 环境检查通过"
}

# 配置环境变量
setup_environment() {
    log_step "5/6 配置环境变量"
    
    log_info "运行环境变量配置脚本..."
    bash scripts/vercel-env.sh setup
    
    log_success "环境变量配置完成"
}

# 部署到 Vercel
deploy_app() {
    log_step "6/6 部署到 Vercel"
    
    log_info "开始部署..."
    
    if vercel --prod --yes; then
        log_success "🎉 部署成功！"
        
        # 获取部署URL
        log_info "获取部署信息..."
        sleep 3  # 等待部署完成
        
        # 显示部署结果
        echo ""
        echo "🚀 部署完成！您的应用已在线："
        echo ""
        echo "📱 应用地址: $(vercel ls | grep -E '(http|https)://[^ ]+' -o | head -1 || echo '请查看 Vercel Dashboard')"
        echo "🔍 健康检查: /api/health"
        echo "📚 API 端点: /api/classics"
        echo "🗄️ 数据库测试: /api/test-db"
        echo ""
        echo "📊 Vercel Dashboard: https://vercel.com/dashboard"
        echo ""
        
    else
        log_error "部署失败，请检查错误信息"
        exit 1
    fi
}

# 主函数
main() {
    echo ""
    echo "🚀 Traditional Chinese Study - 一键部署脚本"
    echo "============================================="
    echo ""
    
    log_info "开始自动化部署流程..."
    echo ""
    
    # 执行部署步骤
    check_project_status
    test_build
    git_commit_push
    check_vercel_env
    setup_environment
    deploy_app
    
    echo ""
    log_success "🎉 部署流程完成！"
    echo ""
    log_info "接下来您可以："
    echo "  1. 访问应用测试功能"
    echo "  2. 在 Vercel Dashboard 查看部署详情"
    echo "  3. 监控应用性能和日志"
    echo ""
}

# 脚本选项处理
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "build-only")
        check_project_status
        test_build
        log_success "仅构建测试完成"
        ;;
    "help")
        echo "用法:"
        echo "  $0 deploy      - 完整部署流程（默认）"
        echo "  $0 build-only  - 仅运行构建测试"
        echo "  $0 help        - 显示帮助信息"
        ;;
    *)
        log_error "未知选项: $1"
        echo "运行 '$0 help' 查看用法"
        exit 1
        ;;
esac