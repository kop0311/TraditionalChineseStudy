# Supabase 数据库设置指南

## 🚀 快速开始

### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 创建新组织（如果需要）
5. 点击 "New Project"
6. 填写项目信息：
   - Name: `traditional-chinese-study`
   - Database Password: 设置一个强密码
   - Region: 选择 `Singapore (Southeast Asia)` 或 `Tokyo (Northeast Asia)`
7. 点击 "Create new project"

### 2. 获取连接信息
项目创建完成后，进入项目仪表板：

1. 点击 ⚙️ Settings → API
2. 复制以下信息：
   - **URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...` 
   - **service_role key**: `eyJ...`

### 3. 运行数据库迁移
1. 在 Supabase 仪表板中，点击 🗃️ **SQL Editor**
2. 点击 "+ New query"
3. 复制粘贴 `backend-rust/migrations/001_initial.sql` 的全部内容
4. 点击 "RUN" 执行 SQL

### 4. 配置 Vercel 环境变量
在 Vercel 项目设置中添加环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. 验证连接
部署后，访问您的应用程序的 `/api/health` 端点来验证数据库连接。

## 📊 数据库表结构

您的数据库将包含以下表：
- `users` - 用户账户
- `classics` - 经典作品（三字经、道德经等）
- `chapters` - 章节
- `sentences` - 句子
- `characters` - 汉字信息
- `user_progress` - 用户学习进度
- `character_progress` - 汉字学习进度
- `practice_sessions` - 练习会话
- `stats` - 用户统计数据

## 🔧 高级配置

### Row Level Security (RLS)
Supabase 默认启用 RLS。您可能需要为每个表设置策略：

```sql
-- 允许用户读取所有经典作品
CREATE POLICY "Allow read classics" ON classics FOR SELECT USING (true);

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON user_progress 
FOR SELECT USING (auth.uid() = user_id);
```

### 数据初始化
您可以导入 `data/` 目录中的 JSON 文件来初始化经典作品数据。

## 🎯 免费额度

Supabase 免费计划包含：
- 500MB 数据库存储
- 50MB 文件存储  
- 5GB 带宽
- 50,000 月活跃用户
- 无限 API 请求

对于初期使用完全足够！

## 🔗 有用链接

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 集成指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)