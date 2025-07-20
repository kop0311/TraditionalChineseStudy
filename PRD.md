产品需求文档（PRD）  
项目名称：小小读书郎 — 儿童中文经典学习 Web MVP（Node.js + MySQL 共享主机原型版）  
版本：v2.0-PROTOTYPE  
作者：PM / 项目经理  
交付日期：2025-07-18  
目标读者：Claude Code（AI 编程助手）+ 开发者本人  
使用约束：NameHero 共享主机（cPanel），Node.js ≤ 18.x，MySQL 8，零预算，仅内测 3 并发以内，可一键迁移 VPS。

────────────────────────────  
目录  
0. 文档目的与阅读指南  
1. 产品愿景 & 成功定义  
2. 范围声明（In-Scope / Out-of-Scope）  
3. 用户角色 & 场景剧本  
4. 功能总览（用户故事地图）  
5. 详细功能规格  
   5.1 经典文本模块  
   5.2 阅读器页面  
   5.3 单字笔顺动画  
   5.4 繁体拆解故事  
   5.5 YouTube 视频嵌入  
   5.6 用户账户与订阅（占位，当前仅本地单用户）  
   5.7 管理后台（CMS）  
   5.8 系统设置 & 开关  
6. 非功能需求  
   6.1 性能 & 容量  
   6.2 兼容性  
   6.3 安全  
   6.4 可用性 / 可维护性  
7. 技术架构 & 技术栈  
8. 数据模型（完整 SQL DDL）  
9. API 规格（OpenAPI 3.0 YAML 片段）  
10. 页面原型（文字版线框）  
11. 任务拆分 & 迭代计划（GitHub Projects 看板）  
12. 测试策略（单元 / 集成 / 手工）  
13. 部署 & 运维手册（cPanel 版 + VPS 迁移版）  
14. 风险登记册  
15. 附录（文件清单、环境变量、第三方资源）

────────────────────────────  
0. 文档目的与阅读指南  
本文档用于：  
A. 让 Claude Code 一行行代码即可跑通全部需求。  
B. 未来迁移 VPS 时无需重写业务逻辑。  
阅读顺序：Claude 先读 7→8→9→11，再读 5。

────────────────────────────  
1. 产品愿景  
“用最经典的中文文本，让孩子在 5 分钟内学会 1 个字。”  
一句话电梯演讲：  
“一个无需安装、打开即用的网页，让海外儿童通过《道德经》《三字经》逐字学中文，看笔顺、听读音、看故事。”

────────────────────────────  
2. 范围声明  
In-Scope（MVP 必须）：  
• 经典文本《道德经》《三字经》全文  
• 简/繁/拼音并列显示  
• 单字笔顺 SVG 动画（前端播放）  
• 基本静态 CMS 入口，可修改故事  
• 无需登录即可浏览；未来登录模块预留表结构  
Out-of-Scope（明确不做）：  
• 支付、订阅、邮件发送  
• 多语言 UI  
• 离线 PWA  
• 社交功能、评论  
• AI 语音评测

────────────────────────────  
3. 用户角色  
U1 小读者（4-12 岁）  
U2 家长 / 老师  
U3 内容管理员（开发者本人）

────────────────────────────  
4. 功能总览（用户故事地图）  
Epic 1 阅读  
  US1.1 作为小读者，我想看到一句简繁对照文本，以便跟读。  
  US1.2 作为小读者，我想点击任意字，看笔顺动画。  
Epic 2 内容管理  
  US2.1 作为管理员，我想在后台改故事文本，无需重启。  
Epic 3 稳定运行  
  US3.1 作为开发者，我想一键部署到共享主机。  
  US3.2 作为开发者，我想日后 5 分钟内迁到 VPS。

────────────────────────────  
5. 详细功能规格  

5.1 经典文本模块  
• 支持两部经典；每部分章节；每章节多句。  
• 文件：/data/daodejing.json, /data/sanzijing.json  
格式：  
{  
  "classic": "道德经",  
  "chapters": [  
    { "chapter_no": 1, "title": "第一章",  
      "sentences": [  
        { "seq":1, "simp":"道可道，非常道。", "trad":"道可道，非常道。", "pinyin":"dào kě dào ， fēi cháng dào 。" }  
      ]}]}

5.2 阅读器页面 /reader/:classicSlug/:chapterNo  
URL 示例：/reader/daodejing/1  
页面结构：  
Header: 经典标题 + 章节标题  
正文：  
<table class="reader">  
  <tr>  
    <td class="simp">道可道</td>  
    <td class="trad">道可道</td>  
    <td class="pinyin">dào kě dào</td>  
  </tr>  
</table>  
JS：点击任意 <td> → Modal 弹出单字卡片。

5.3 单字笔顺动画  
• 数据来源：make-me-a-hanzi 项目 stroke_order.json，仅保留出现在文本中的字。  
• 字段：characters.stroke_order_json (TEXT)  
• 前端：hanzi-writer.min.js，CDN 引入。  
交互：  
– Modal 标题：简体 / 繁体 / 拼音  
– Canvas 播放动画，按钮：重播、慢速。

5.4 繁体拆解故事  
• 表 characters.story_html (TEXT) 存储富文本。  
• 若无内容，前端隐藏“故事”Tab。

5.5 YouTube 嵌入  
• sentences.youtube_id 存 11 位 ID。  
• 前端懒加载 iframe，允许家长点击后才加载（节省流量）。  
• 隐私增强模式：youtube-nocookie.com。

5.6 用户账户（占位）  
users, sessions, subscriptions 表结构已给出，但 MVP 仅插入一条默认管理员记录，无需注册流程。  
登录路由 /admin 使用 Basic Auth：admin / 123456（环境变量 ADMIN_PASS）。

5.7 管理后台 /admin  
• 路由：/admin/login, /admin/dashboard, /admin/characters/:id/edit  
• 功能：富文本编辑器 TinyMCE CDN，保存到 story_html。  
• 权限：仅管理员。

5.8 系统开关  
.env 文件（写入共享主机 ~/app/.env）：  
PORT=3000  
NODE_ENV=production  
ADMIN_PASS=123456  
CDN_HANZI=https://cdn.jsdelivr.net/npm/hanzi-writer@1.3/dist/hanzi-writer.min.js  
CDN_BOOTSTRAP=https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css

────────────────────────────  
6. 非功能需求  

6.1 性能 & 容量  
• 支持 3 并发，平均响应 < 300 ms；峰值 CPU < 30 %。  
• 数据量：道德经 5000 字、三字经 1100 字，characters 表 < 800 行。

6.2 兼容性  
• Chrome 90+, Firefox 88+, Safari 14+, Edge 90+。  
• 移动端 iOS 14 / Android 10 主流浏览器。

6.3 安全  
• Helmet 默认设置；禁止 iframe 嵌入本站。  
• 所有 SQL 使用参数化查询；XSS 过滤 DOMPurify。  
• 上传文件限制 2 MB，仅允许 jpg/png。  

6.4 可用性 / 可维护性  
• 单文件一键启动：node app.js  
• 日志：winston 写 ./logs/app.log，每日滚动。  
• 监控：health-check 路由 /ping 返回 {status:ok,uptime:xxx}

────────────────────────────  
7. 技术架构  

┌────────────┐  
│  Browser   │  
└────┬───────┘  
     │ HTTPS  
┌────┴───────┐  
│  cPanel    │  
│  Apache    │ ─ .htaccess proxy / → localhost:3000  
└────┬───────┘  
┌────┴───────┐  
│  Node.js   │ Express + Sequelize  
│  app.js    │  
└────┬───────┘  
┌────┴───────┐  
│  MySQL     │ utf8mb4  
└────────────┘  

迁移到 VPS 时仅把 Apache 换成 Nginx 反向代理，无业务代码改动。

────────────────────────────  
8. 数据模型（DDL）  
-- 运行 scripts/migrate.js 自动执行  
CREATE DATABASE IF NOT EXISTS xiaoxiao_dushulang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xiaoxiao_dushulang;

CREATE TABLE classics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(32) UNIQUE,
  title VARCHAR(64),
  author VARCHAR(64),
  dynasty VARCHAR(32)
);

CREATE TABLE chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  classic_id INT,
  chapter_no INT,
  title VARCHAR(128),
  FOREIGN KEY (classic_id) REFERENCES classics(id)
);

CREATE TABLE sentences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT,
  seq_no INT,
  simp TEXT,
  trad TEXT,
  pinyin_json JSON,
  youtube_id VARCHAR(16),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  simp_char CHAR(1),
  trad_char CHAR(1),
  stroke_order_json JSON,
  radical VARCHAR(16),
  story_html TEXT
);

-- 占位用户系统
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash CHAR(60),
  role ENUM('admin','user') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users(email,password_hash,role) VALUES
('admin@local','$2b$12$...hash_of_123456','admin');

CREATE TABLE sessions (
  sid CHAR(64) PRIMARY KEY,
  user_id INT,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sentence_id INT,
  ip VARCHAR(45),
  ua VARCHAR(255),
  ts DATETIME DEFAULT CURRENT_TIMESTAMP
);

索引：characters.simp_char, characters.trad_char, sessions.expires_at.

────────────────────────────  
9. API 规格（YAML 片段）  

paths:  
  /api/classics:  
    get:  
      summary: 返回经典列表  
      responses:  
        200:  
          schema: {type: array, items: {$ref: '#/components/schemas/Classic'}}  

  /api/chapters/{classicSlug}:  
    get:  
      parameters: [ {name: classicSlug, in: path, required: true, schema: {type: string}} ]  
      responses: {200: {schema: {type: array, items: {$ref: '#/components/schemas/Chapter'}}}}  

  /api/sentences/{chapterId}:  
    get:  
      parameters: [ {name: chapterId, in: path, required: true, schema: {type: integer}} ]  
      responses: {200: {schema: {type: array, items: {$ref: '#/components/schemas/Sentence'}}}}  

  /api/characters/{char}:  
    get:  
      parameters: [ {name: char, in: path, required: true, schema: {type: string}} ]  
      responses: {200: {schema: {$ref: '#/components/schemas/Character'}}}  

components:  
  schemas:  
    Classic: {type: object, properties: {id: {type: integer}, slug: {type: string}, title: {type: string}}}  
    Chapter: {type: object, properties: {id: {type: integer}, chapter_no: {type: integer}, title: {type: string}}}  
    Sentence: {type: object, properties: {id: {type: integer}, seq_no: {type: integer}, simp: {type: string}, trad: {type: string}, pinyin: {type: string}, youtube_id: {type: string}}}  
    Character: {type: object, properties: {simp_char: {type: string}, trad_char: {type: string}, stroke_order_json: {type: object}, story_html: {type: string}}}

────────────────────────────  
10. 页面原型（文字版线框）  

/reader/daodejing/1  
┌────────────────────────────┐  
│ Logo | 道德经 · 第一章      │  
├────────────────────────────┤  
│ [简体] 道可道，非常道。      │  
│ [繁体] 道可道，非常道。      │  
│ [拼音] dào kě dào ， fēi... │  
│                            │  
│ < 上一章 | 目录 | 下一章 >  │  
└────────────────────────────┘  

Modal（点击“道”）  
┌────────────────────────────┐  
│ 道 (dào)                   │  
│ Tab1 笔顺 | Tab2 故事      │  
│ ┌──────┐                  │  
│ │Canvas│ 播放/慢速/重播    │  
│ └──────┘                  │  
└────────────────────────────┘  

/admin/characters/道  
┌────────────────────────────┐  
│ 编辑“道”的故事             │  
│ [TinyMCE] story_html       │  
│ [保存]                     │  
└────────────────────────────┘  

────────────────────────────  
11. 任务拆分 & 迭代计划（GitHub Projects 看板）  

Backlog 列  
- [ ] 1. 环境搭建（cPanel Node 配置）  
- [ ] 2. MySQL 建表脚本  
- [ ] 3. 数据导入脚本（经典文本+字符）  
- [ ] 4. Express 基础脚手架  
- [ ] 5. 阅读器路由 + EJS 模板  
- [ ] 6. 单字 Modal + 笔顺动画  
- [ ] 7. /admin 登录 + 字符编辑  
- [ ] 8. 静态文件压缩、缓存头  
- [ ] 9. 健康检查 /ping  
- [ ] 10. README + 一键部署脚本  

Sprint 1（本周完成 1-5）  
Sprint 2（下周完成 6-10）  

────────────────────────────  
12. 测试策略  

单元测试：Jest + Supertest 覆盖 /api/* 路由  
集成测试：  
- 使用 GitHub Actions + MySQL Service Container  
- 断言：GET /api/sentences/1 返回 200 且 JSON 正确  
手工测试：  
- 手机 Safari 点击字 → Modal 出现  
- 后台修改故事 → 刷新页面立即生效  

────────────────────────────  
13. 部署 & 运维手册  

13.1 cPanel 共享主机  
步骤：  
1. cPanel → “Setup Node.js App” → 选择 Node 18.x → Application root ~/app → 启动文件 app.js → Run NPM Install → Save  
2. 上传代码到 ~/app (GitHub zip)  
3. SSH: npm ci --production  
4. 创建 .env 文件（见 5.8）  
5. scripts/migrate.js && scripts/seed.js  
6. Apache .htaccess（项目内已提供 /public/.htaccess）：  
   RewriteEngine On  
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]  
7. 启动：pm2 start app.js --name xiaoxiao-dushulang 或 node app.js &  
8. Cron：每 10 分钟 /usr/bin/node ~/app/cron/keepalive.js（若共享主机杀进程）

13.2 未来 VPS 迁移  
只需：  
- 安装 Node 20 + MySQL 8  
- 把 ~/app 整个目录 scp 过去  
- systemctl 启动 pm2 + nginx 反向代理  
- 迁移脚本：mysqldump | mysql new_vps

────────────────────────────  
14. 风险登记册  

| 风险 | 概率 | 影响 | 对策 |  
| 共享主机随时限流 | 中 | 高 | 监控 /ping 502 时自动重启 |  
| stroke_order.json 缺字 | 低 | 中 | 用“□”占位，后台可补录 |  
| 中文 CDN 被墙 | 低 | 中 | 字体、JS 放本地 /public/vendor |  
| TinyMCE 加载慢 | 低 | 低 | 使用 CDN + 本地 fallback |  

────────────────────────────  
15. 附录  

A. 文件/目录结构  
/app  
 ├ app.js  
 ├ routes/  
 ├ models/ (Sequelize)  
 ├ views/ (EJS)  
 ├ public/ (css,js,images,vendor)  
 ├ data/ (json)  
 ├ scripts/ (migrate.js, seed.js)  
 ├ cron/  
 ├ tests/  
 └ .env.example  

B. 环境变量清单  
PORT  
NODE_ENV  
DB_HOST / DB_USER / DB_PASS / DB_NAME  
ADMIN_PASS  
CDN_HANZI  
CDN_BOOTSTRAP  

C. 第三方资源  
• make-me-a-hanzi data (MIT)  
• hanzi-writer (MIT)  
• Bootstrap 5 (MIT)  
• TinyMCE 6 (MIT core)  

────────────────────────────  
End of PRD