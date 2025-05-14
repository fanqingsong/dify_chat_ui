import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { hash } from 'bcrypt';
import { authOptions } from '../../../auth/[...nextauth]/route';

// 只允许管理员访问的中间件
async function checkAdminAccess() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return false;
    }

    return true;
}

// 获取单个用户
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json(
                { error: '无权访问管理员资源' },
                { status: 403 }
            );
        }

        const { userId } = params;

        // 获取用户（不包括密码）
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: '未找到用户' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('获取用户错误:', error);
        return NextResponse.json(
            { error: error.message || '获取用户失败' },
            { status: 500 }
        );
    }
}

// 更新用户（角色、状态等）
export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json(
                { error: '无权访问管理员资源' },
                { status: 403 }
            );
        }

        const { userId } = params;
        const { roleId, isActive, password } = await request.json();

        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: '未找到用户' },
                { status: 404 }
            );
        }

        // 防止管理员更改自己的状态或角色
        const session = await getServerSession(authOptions);
        if (session?.user?.id === userId) {
            return NextResponse.json(
                { error: '管理员不能更改自己的状态或角色' },
                { status: 400 }
            );
        }

        // 准备更新数据
        const updateData: any = {};

        // 如果提供了角色ID，检查角色是否存在
        if (roleId !== undefined) {
            if (roleId) {
                const role = await prisma.role.findUnique({
                    where: { id: roleId }
                });

                if (!role) {
                    return NextResponse.json(
                        { error: '指定的角色不存在' },
                        { status: 400 }
                    );
                }

                if (!role.isActive) {
                    return NextResponse.json(
                        { error: '无法分配已禁用的角色' },
                        { status: 400 }
                    );
                }

                updateData.roleId = roleId;
            } else {
                // 如果roleId为空，则移除角色
                updateData.roleId = null;
            }
        }

        // 如果提供了激活状态，更新
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // 如果提供了新密码，进行哈希处理
        if (password) {
            const hashedPassword = await hash(password, 10);
            updateData.password = hashedPassword;
        }

        // 更新用户
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
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
            }
        });

        return NextResponse.json({
            ...updatedUser,
            message: '用户信息已更新'
        });
    } catch (error: any) {
        console.error('更新用户错误:', error);
        return NextResponse.json(
            { error: error.message || '更新用户失败' },
            { status: 500 }
        );
    }
} 