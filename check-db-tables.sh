#!/bin/bash

echo "===== 检查数据库表结构 ====="

# 确保 PostgreSQL 正在运行
echo "检查 PostgreSQL 容器状态..."
if ! docker ps | grep -q dify_postgres; then
  echo "PostgreSQL 容器未运行，正在启动..."
  docker-compose up -d postgres
  sleep 5
else
  echo "PostgreSQL 容器已在运行"
fi

# 使用 psql 查询数据库表
echo "查询数据库表..."
echo "---------------------"

# 列出所有表
docker exec -it dify_postgres psql -U postgres -d auth_db -c "\dt"

echo ""
echo "表详情:"
echo "---------------------"

# 查看 User 表结构
echo "User 表结构:"
docker exec -it dify_postgres psql -U postgres -d auth_db -c "\d \"User\""

echo ""
echo "Account 表结构:"
docker exec -it dify_postgres psql -U postgres -d auth_db -c "\d \"Account\""

echo ""
echo "Session 表结构:"
docker exec -it dify_postgres psql -U postgres -d auth_db -c "\d \"Session\""

echo ""
echo "VerificationToken 表结构:"
docker exec -it dify_postgres psql -U postgres -d auth_db -c "\d \"VerificationToken\""

echo ""
echo "===== 检查完成 ====="
echo "要使用图形界面管理数据库，请运行:"
echo "./start-pgadmin.sh" 