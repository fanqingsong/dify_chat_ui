#!/bin/bash

echo "=== 开始修复 NextAuth.js 问题 ==="

# 安装必要的包
echo "正在安装 next-auth..."
npm install next-auth

# 创建 .env.local 文件
echo "创建 .env.local 文件..."
cat > .env.local << 'EOL'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# APP ID
NEXT_PUBLIC_APP_ID=

# APP API Key
NEXT_PUBLIC_APP_KEY=

# APP URL
NEXT_PUBLIC_API_URL=
EOL

# 启动开发服务器
echo "修复完成！您现在可以使用以下命令启动开发服务器："
echo "npm run dev"
echo ""
echo "登录测试账号："
echo "邮箱: test@example.com"
echo "密码: test"
echo ""
echo "=== 修复脚本完成 ===" 