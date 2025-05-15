import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// 只允许管理员访问的中间件
async function checkAdminAccess() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return false;
    }

    return true;
}

// 获取所有用户
export async function GET() {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json(
                { error: '无权访问管理员资源' },
                { status: 403 }
            );
        }

        // 获取所有用户
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // 获取所有用户角色
        const userRoles = await prisma.$queryRaw`
            SELECT ur."userId", ur."roleId", r.name as "roleName", r.description, ur.id 
            FROM "UserRoles" ur
            JOIN "Role" r ON ur."roleId" = r.id
        `;

        // 按用户ID组织角色数据
        const rolesByUserId = {};
        for (const ur of userRoles) {
            if (!rolesByUserId[ur.userId]) {
                rolesByUserId[ur.userId] = [];
            }
            rolesByUserId[ur.userId].push({
                id: ur.id,
                roleId: ur.roleId,
                roleName: ur.roleName,
                description: ur.description
            });
        }

        // 合并用户和角色数据
        const usersWithRoles = users.map(user => ({
            ...user,
            roles: rolesByUserId[user.id] || []
        }));

        return NextResponse.json(usersWithRoles);
    } catch (error: any) {
        console.error('获取用户列表错误:', error);
        return NextResponse.json(
            { error: error.message || '获取用户列表失败' },
            { status: 500 }
        );
    }
} 