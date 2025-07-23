# 🚀 Vercel 部署指南

## 📋 快速开始

### 一键部署（推荐）
```bash
# 运行完整部署流程
./scripts/deploy.sh

# 仅测试构建
./scripts/deploy.sh build-only
```

### 分步部署
```bash
# 1. 仅配置环境变量
./scripts/vercel-env.sh setup

# 2. 手动部署
./scripts/vercel-setup.sh
```

## 🔧 脚本说明

### 1. `deploy.sh` - 一键部署脚本
**完整的自动化部署流程，包含：**
- ✅ 项目状态检查
- ✅ 本地构建测试
- ✅ Git 提交和推送
- ✅ Vercel 环境检查
- ✅ 环境变量配置
- ✅ 生产环境部署

### 2. `vercel-setup.sh` - Vercel 部署脚本
**专注于 Vercel 平台的部署：**
- 检查 Vercel CLI 安装
- 自动登录 Vercel
- 配置环境变量
- 执行生产部署
- 显示部署结果

### 3. `vercel-env.sh` - 环境变量配置脚本
**独立的环境变量管理工具：**
```bash
./scripts/vercel-env.sh setup  # 配置所有环境变量
./scripts/vercel-env.sh list   # 查看当前环境变量
./scripts/vercel-env.sh help   # 显示帮助
```

## 📋 环境变量清单

### Supabase 数据库配置
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### CDN 配置
- `CDN_BOOTSTRAP`
- `CDN_HANZI`
- `CDN_TINYMCE`

### 应用配置
- `NODE_ENV`
- `NEXT_TELEMETRY_DISABLED`
- `LOG_LEVEL`

### 速率限制配置
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_MAX`
- `API_RATE_LIMIT_MAX`

### 文件上传配置
- `UPLOAD_MAX_SIZE`
- `UPLOAD_ALLOWED_TYPES`

## 🔍 部署验证

部署完成后，访问以下端点验证功能：

```bash
# 健康检查
curl https://your-app.vercel.app/api/health

# 数据库连接测试
curl https://your-app.vercel.app/api/test-db

# 经典作品API
curl https://your-app.vercel.app/api/classics
```

## 🚨 故障排除

### 常见问题

**1. Vercel CLI 未安装**
```bash
npm i -g vercel
```

**2. 构建失败**
```bash
# 本地测试构建
bun next build

# 检查依赖
bun install
```

**3. 环境变量未设置**
```bash
# 重新配置环境变量
./scripts/vercel-env.sh setup

# 查看当前配置
vercel env ls
```

**4. 数据库连接失败**
- 检查 Supabase 项目状态
- 验证 API Keys 是否正确
- 确认数据库表已创建

### 日志查看
```bash
# Vercel 部署日志
vercel logs

# 实时日志
vercel logs --follow
```

## 📊 监控和维护

### Vercel Dashboard
- 访问: https://vercel.com/dashboard
- 查看部署状态、性能指标、错误日志

### Supabase Dashboard
- 访问: https://supabase.com/dashboard
- 监控数据库性能、查询统计

## 🔄 更新部署

### 代码更新后重新部署
```bash
# 提交代码更改
git add .
git commit -m "your changes"
git push origin main

# 重新部署
./scripts/deploy.sh
```

### 仅更新环境变量
```bash
./scripts/vercel-env.sh setup
vercel --prod
```

## 📈 性能优化建议

1. **启用 CDN 缓存**
   - 静态资源自动缓存
   - API 响应适当缓存

2. **监控构建时间**
   - 构建时间应 < 2 分钟
   - 包大小保持在合理范围

3. **数据库优化**
   - 监控 Supabase 使用情况
   - 定期检查查询性能

## 🎯 部署检查清单

- [ ] 本地构建成功
- [ ] 所有测试通过
- [ ] 环境变量已配置
- [ ] Supabase 数据库正常
- [ ] Git 代码已推送
- [ ] Vercel 部署成功
- [ ] API 端点正常响应
- [ ] 前端页面正常加载

---

🎉 **恭喜！您的应用已成功部署到 Vercel！**