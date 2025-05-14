#!/bin/bash

echo "===== 数据库初始化脚本 ====="
echo "确保数据库已启动且环境变量已设置"

# 创建 .env 文件（Prisma 会优先读取这个文件）
echo "创建 .env 文件..."
cat > .env << EOL
# 数据库连接 - Prisma 会优先读取这个文件
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db"

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-me

# APP 配置
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_APP_KEY=
NEXT_PUBLIC_API_URL=
EOL
echo ".env 文件已创建"

# 创建 .env.local 文件（如果不存在）
if [ ! -f .env.local ]; then
  echo "创建 .env.local 文件..."
  cat > .env.local << EOL
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-me

# 开发环境数据库连接
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db"

# APP 配置
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_APP_KEY=
NEXT_PUBLIC_API_URL=
EOL
  echo ".env.local 文件已创建"
fi

# 检查 PostgreSQL 是否运行
echo "检查数据库连接..."
if command -v docker &> /dev/null; then
  if ! docker ps | grep -q postgres; then
    echo "正在启动 PostgreSQL 容器..."
    docker-compose up -d postgres
    # 给数据库一些启动时间
    sleep 5
  else
    echo "PostgreSQL 容器已在运行"
  fi
else
  echo "未检测到 Docker，请确保 PostgreSQL 已在运行"
fi

# 安装依赖
echo "安装依赖..."
npm install

# 初始化数据库
echo "运行 Prisma 迁移..."
npx prisma migrate dev --name init

echo "生成 Prisma 客户端..."
npx prisma generate

echo "===== 数据库初始化完成 ====="
echo "现在你可以运行 'npm run dev' 启动应用" 