# 使用官方Node.js 18运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖（开发环境包含devDependencies）
RUN npm ci

# 复制项目文件
COPY . .

# 创建必要的目录
RUN mkdir -p logs uploads

# 设置文件权限
RUN chown -R node:node /app
USER node

# 暴露端口
EXPOSE 9005

# 定义环境变量
ENV NODE_ENV=development
ENV PORT=9005

# 启动应用（开发环境使用nodemon）
CMD ["npm", "run", "dev"]