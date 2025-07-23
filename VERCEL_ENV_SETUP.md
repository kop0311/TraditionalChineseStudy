# Vercel 环境变量配置指南

## 🔧 必需的环境变量

在 Vercel 项目设置中添加以下环境变量：

### 1. Supabase 数据库配置
```
NEXT_PUBLIC_SUPABASE_URL=https://tvufiqqsrankufybqmbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWZpcXFzcmFua3VmeWJxbWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDcwNzYsImV4cCI6MjA2ODgyMzA3Nn0.RVaSELCwqBGH8jpfNcVNWwGdDu2CsCMSno5KNviFbG4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWZpcXFzcmFua3VmeWJxbWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI0NzA3NiwiZXhwIjoyMDY4ODIzMDc2fQ.MsMxjRsGSFKKk12jTTon989DsTKYGMXD8-9wIjhRDWg
```

### 2. CDN 配置
```
CDN_BOOTSTRAP=https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
CDN_HANZI=https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js
CDN_TINYMCE=https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js
```

### 3. 应用配置
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=warn
```

### 4. 速率限制配置
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=5
API_RATE_LIMIT_MAX=100
```

### 5. 文件上传配置
```
UPLOAD_MAX_SIZE=2097152
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif
```

## 📝 如何在 Vercel 中设置

1. 访问 Vercel 项目仪表板
2. 点击 **Settings** 标签
3. 点击 **Environment Variables**
4. 逐个添加上述环境变量
5. 选择适用的环境（Production, Preview, Development）
6. 点击 **Save**

## ⚠️ 重要说明

- 所有 `NEXT_PUBLIC_*` 变量将暴露给客户端
- `SUPABASE_SERVICE_ROLE_KEY` 仅用于服务端，具有管理员权限
- 确保所有变量都设置在 **Production** 环境中

## 🚀 部署后验证

部署完成后，访问以下端点验证配置：
- `/api/health` - 检查数据库连接
- `/api/classics` - 验证数据库查询功能