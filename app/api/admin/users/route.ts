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

        // 获取所有用户，包含角色信息，但不返回密码
        const users = await prisma.user.findMany({
            include: { role: true },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isAdmin: true,
                isActive: true,
                role: true,
                roleId: true,
                createdAt: true,
                updatedAt: true,
                password: false, // 不返回密码
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('获取用户列表错误:', error);
        return NextResponse.json(
            { error: error.message || '获取用户列表失败' },
            { status: 500 }
        );
    }
} 