# cPanel 共享主机部署指南

## 前置要求

- cPanel 面板访问权限
- 支持 Node.js 18.x 的共享主机
- MySQL 数据库
- SSH 访问权限（推荐）

## 部署步骤

### 1. 准备项目文件

在本地打包项目（排除 node_modules）：

```bash
# 在项目根目录执行
zip -r xiaodaode.zip . -x "node_modules/*" ".git/*" "*.log" "logs/*"
```

### 2. 上传文件

1. 登录 cPanel
2. 进入 "文件管理器"
3. 创建 `app` 目录（如果不存在）
4. 上传 `xiaodaode.zip` 到 `~/app` 目录
5. 解压文件：右键点击 zip 文件 → Extract

### 3. 配置 Node.js 应用

1. 在 cPanel 中找到 "Setup Node.js App"
2. 点击 "Create Application"
3. 配置如下：
   - **Node.js version**: 18.x
   - **Application mode**: Production
   - **Application root**: app
   - **Application URL**: 留空（使用主域名）
   - **Application startup file**: app.js
4. 点击 "Create"

### 4. 安装依赖包

1. 在应用列表中点击 "Run NPM Install"
2. 等待安装完成

### 5. 配置环境变量

通过 cPanel 文件管理器或 SSH 创建 `.env` 文件：

```bash
# 进入应用目录
cd ~/app

# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

重要配置项：

```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
ADMIN_PASS=your_admin_password
SESSION_SECRET=your_session_secret
```

### 6. 创建数据库

1. 在 cPanel 中进入 "MySQL 数据库"
2. 创建新数据库（如：`xiaodaode`）
3. 创建数据库用户
4. 将用户分配到数据库，给予所有权限

### 7. 初始化数据库

通过 SSH 或在线终端执行：

```bash
cd ~/app

# 运行数据库迁移
node scripts/migrate.js

# 导入初始数据
node scripts/seed.js
```

### 8. 配置 .htaccess

项目已包含 `.htaccess` 文件在 `public` 目录中。如果需要自定义，编辑 `public/.htaccess`：

```apache
RewriteEngine On

# 代理所有请求到 Node.js 应用
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# 设置静态文件缓存
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
</IfModule>
```

### 9. 启动应用

1. 回到 "Setup Node.js App"
2. 点击应用旁边的 "Start" 按钮
3. 应用状态变为 "Running"

### 10. 配置域名指向

如果使用自定义域名：

1. 在 cPanel 中进入 "子域"
2. 创建子域指向 `public` 目录
3. 或者在 "重定向" 中设置主域名指向 `public` 目录

### 11. 设置 Cron 任务保活

1. 在 cPanel 中进入 "Cron 任务"
2. 添加新任务：

```bash
# 每10分钟执行一次保活脚本
*/10 * * * * /usr/bin/node ~/app/cron/keepalive.js >> ~/app/logs/keepalive.log 2>&1
```

## 测试部署

访问以下链接测试：

- 主页：`https://yourdomain.com`
- 健康检查：`https://yourdomain.com/ping`
- 管理后台：`https://yourdomain.com/admin`

## 故障排除

### 应用无法启动

1. 检查 Node.js 版本兼容性
2. 查看错误日志：cPanel → "Setup Node.js App" → "Log Files"
3. 确认 `.env` 文件配置正确
4. 验证数据库连接

### 静态文件不加载

1. 检查 `.htaccess` 文件位置和内容
2. 确认 Apache 模块启用：
   - mod_rewrite
   - mod_proxy
   - mod_proxy_http

### 数据库连接失败

1. 验证数据库凭据
2. 检查数据库用户权限
3. 确认数据库服务器地址（通常是 localhost）

### 应用经常掉线

1. 确认 Cron 保活任务已设置
2. 联系主机商确认进程管理策略
3. 考虑升级到 VPS

## 性能优化

### 启用压缩

在 `.htaccess` 中添加：

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>
```

### 设置缓存头

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|svg)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</IfModule>
```

## 日志管理

应用日志位置：
- 应用日志：`~/app/logs/app-YYYY-MM-DD.log`
- 保活日志：`~/app/logs/keepalive.log`
- Node.js 错误日志：cPanel 应用管理界面

定期清理日志：

```bash
# 删除30天前的日志
find ~/app/logs -name "*.log" -mtime +30 -delete
```

## 备份策略

### 代码备份

```bash
# 压缩应用目录
tar -czf xiaodaode-backup-$(date +%Y%m%d).tar.gz ~/app
```

### 数据库备份

```bash
# 导出数据库
mysqldump -u username -p database_name > xiaodaode-db-$(date +%Y%m%d).sql
```

## 迁移到 VPS

当需要迁移到 VPS 时：

1. 备份数据库和代码
2. 在 VPS 上安装 Node.js 和 MySQL
3. 恢复代码和数据库
4. 配置 Nginx 反向代理
5. 使用 PM2 管理进程

迁移脚本已包含在 `scripts/deploy.sh` 中。