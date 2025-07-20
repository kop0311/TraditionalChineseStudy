#!/bin/bash

# 小小读书郎部署脚本
# 适用于 VPS 部署

set -e  # 遇到错误立即退出

echo "=== 小小读书郎部署脚本 ==="
echo "开始部署..."

# 检查系统要求
check_requirements() {
    echo "检查系统要求..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    
    if ! command -v mysql &> /dev/null; then
        echo "❌ MySQL 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ Node.js 版本过低，需要 16.0+"
        exit 1
    fi
    
    echo "✅ 系统要求检查通过"
}

# 安装依赖
install_dependencies() {
    echo "安装项目依赖..."
    npm ci --production
    echo "✅ 依赖安装完成"
}

# 配置环境变量
setup_env() {
    echo "配置环境变量..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "📝 已创建 .env 文件，请编辑数据库配置"
        else
            echo "❌ 未找到 .env.example 文件"
            exit 1
        fi
    fi
    
    # 提示用户编辑配置
    echo "⚠️  请编辑 .env 文件，配置正确的数据库连接信息"
    echo "按 Enter 继续..."
    read
}

# 初始化数据库
setup_database() {
    echo "初始化数据库..."
    
    # 运行迁移
    node scripts/migrate.js
    if [ $? -eq 0 ]; then
        echo "✅ 数据库迁移完成"
    else
        echo "❌ 数据库迁移失败"
        exit 1
    fi
    
    # 导入种子数据
    node scripts/seed.js
    if [ $? -eq 0 ]; then
        echo "✅ 种子数据导入完成"
    else
        echo "❌ 种子数据导入失败"
        exit 1
    fi
}

# 配置 PM2
setup_pm2() {
    echo "配置 PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        echo "安装 PM2..."
        npm install -g pm2
    fi
    
    # 停止可能存在的进程
    pm2 stop xiaoxiao-dushulang 2>/dev/null || true
    pm2 delete xiaoxiao-dushulang 2>/dev/null || true
    
    # 启动应用
    pm2 start app.js --name xiaoxiao-dushulang
    
    # 保存 PM2 配置
    pm2 save
    
    # 设置开机启动
    pm2 startup
    
    echo "✅ PM2 配置完成"
}

# 配置 Nginx
setup_nginx() {
    echo "配置 Nginx..."
    
    DOMAIN=${1:-localhost}
    
    cat > /etc/nginx/sites-available/xiaoxiao-dushulang << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /public/ {
        alias $(pwd)/public/;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/xiaoxiao-dushulang /etc/nginx/sites-enabled/
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    
    echo "✅ Nginx 配置完成"
}

# 创建日志目录
create_log_dir() {
    echo "创建日志目录..."
    mkdir -p logs
    chmod 755 logs
    echo "✅ 日志目录创建完成"
}

# 设置文件权限
set_permissions() {
    echo "设置文件权限..."
    
    # 设置应用目录权限
    find . -type d -exec chmod 755 {} \;
    find . -type f -exec chmod 644 {} \;
    
    # 设置可执行文件权限
    chmod +x scripts/*.sh
    chmod +x cron/*.js
    
    echo "✅ 文件权限设置完成"
}

# 测试部署
test_deployment() {
    echo "测试部署..."
    
    # 等待应用启动
    sleep 5
    
    # 测试健康检查
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ping)
    
    if [ "$response" = "200" ]; then
        echo "✅ 应用启动成功"
        echo "🎉 部署完成！"
        echo "访问地址: http://localhost:3000"
        echo "管理后台: http://localhost:3000/admin"
    else
        echo "❌ 应用启动失败"
        echo "请查看日志: pm2 logs xiaoxiao-dushulang"
        exit 1
    fi
}

# 主部署流程
main() {
    echo "开始部署流程..."
    
    check_requirements
    install_dependencies
    setup_env
    create_log_dir
    set_permissions
    setup_database
    setup_pm2
    
    # 如果是 root 用户且有 nginx，配置反向代理
    if [ "$EUID" -eq 0 ] && command -v nginx &> /dev/null; then
        echo "检测到 Nginx，是否配置反向代理？(y/n)"
        read -r configure_nginx
        if [ "$configure_nginx" = "y" ]; then
            echo "请输入域名（默认 localhost）:"
            read -r domain
            setup_nginx "$domain"
        fi
    fi
    
    test_deployment
}

# 运行主函数
main "$@"