#!/bin/bash

echo "===== 启动 PostgreSQL 和 pgAdmin 服务 ====="

# 确保 Docker 正在运行
echo "检查 Docker 状态..."
if ! docker info > /dev/null 2>&1; then
  echo "错误: Docker 不在运行状态！请先启动 Docker。"
  exit 1
fi

# 启动 PostgreSQL 和 pgAdmin
echo "启动 PostgreSQL 和 pgAdmin 服务..."
docker-compose up -d postgres pgadmin

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo "检查服务状态..."
docker-compose ps

echo ""
echo "===== 访问说明 ====="
echo "pgAdmin 已启动，请通过浏览器访问:"
echo "http://localhost:5050"
echo ""
echo "登录凭据:"
echo "邮箱: admin@admin.com"
echo "密码: admin"
echo ""
echo "首次登录后，您需要添加服务器连接:"
echo "1. 右键点击 'Servers' > 'Register' > 'Server...'"
echo "2. 在 'General' 标签，输入名称: PostgreSQL"
echo "3. 切换到 'Connection' 标签，填写以下信息:"
echo "   - Host name/address: postgres"
echo "   - Port: 5432"
echo "   - Username: postgres"
echo "   - Password: postgres"
echo "4. 点击 'Save' 保存连接"
echo ""
echo "连接后，您可以查看 'auth_db' 数据库中的表结构" 