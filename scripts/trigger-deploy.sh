#!/bin/bash

# 触发 Vercel 重新部署脚本
# 用于强制使用最新代码进行部署

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

echo ""
log_info "🚀 触发 Vercel 重新部署"
echo "=============================="
echo ""

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    log_error "Vercel CLI 未安装，请运行: npm i -g vercel"
    exit 1
fi

# 检查登录状态
if ! vercel whoami &> /dev/null; then
    log_info "需要登录 Vercel..."
    vercel login
fi

log_info "当前 Git 提交: $(git rev-parse --short HEAD)"
log_info "推送最新代码到 GitHub..."

# 确保最新代码已推送
git push origin main

log_info "触发 Vercel 重新部署..."

# 使用 --force 标志强制重新部署
if vercel --prod --force --yes; then
    log_success "🎉 重新部署成功！"
    echo ""
    log_info "部署使用的是最新提交: $(git rev-parse --short HEAD)"
    echo ""
    log_info "您可以在 Vercel Dashboard 查看部署状态："
    echo "https://vercel.com/dashboard"
else
    log_error "部署失败，请检查错误信息"
    exit 1
fi

echo ""
log_success "✅ 完成！"
echo ""