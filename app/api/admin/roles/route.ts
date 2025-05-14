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

// 获取所有角色
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

        // 获取所有角色
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(roles);
    } catch (error: any) {
        console.error('获取角色列表错误:', error);
        return NextResponse.json(
            { error: error.message || '获取角色列表失败' },
            { status: 500 }
        );
    }
}

// 创建新角色
export async function POST(request: NextRequest) {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json(
                { error: '无权访问管理员资源' },
                { status: 403 }
            );
        }

        // 解析请求体
        const { name, description, isActive = true } = await request.json();

        // 验证输入
        if (!name) {
            return NextResponse.json(
                { error: '角色名称不能为空' },
                { status: 400 }
            );
        }

        // 检查角色名是否已存在
        const existingRole = await prisma.role.findUnique({
            where: { name }
        });

        if (existingRole) {
            return NextResponse.json(
                { error: '角色名称已存在' },
                { status: 409 }
            );
        }

        // 创建角色
        const role = await prisma.role.create({
            data: {
                name,
                description,
                isActive
            }
        });

        return NextResponse.json(role);
    } catch (error: any) {
        console.error('创建角色错误:', error);
        return NextResponse.json(
            { error: error.message || '创建角色失败' },
            { status: 500 }
        );
    }
} 