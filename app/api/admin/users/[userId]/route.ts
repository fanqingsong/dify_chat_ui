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

        // 先await params对象
        const resolvedParams = await params;
        const userId = resolvedParams.userId;

        // 获取用户（不包括密码）
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: '未找到用户' },
                { status: 404 }
            );
        }

        // 单独获取用户的角色
        const userRoles = await prisma.$queryRaw`
            SELECT "UserRoles".id, "UserRoles"."roleId", "Role".name as "roleName", "Role".description
            FROM "UserRoles"
            JOIN "Role" ON "UserRoles"."roleId" = "Role".id
            WHERE "UserRoles"."userId" = ${userId}
        `;

        // 合并用户信息和角色
        const userWithRoles = {
            ...user,
            roles: userRoles
        };

        return NextResponse.json(userWithRoles);
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

        // 先await params对象
        const resolvedParams = await params;
        const userId = resolvedParams.userId;

        const { roleIds, isActive, password } = await request.json();

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

        // 如果提供了激活状态，更新
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // 如果提供了新密码，进行哈希处理
        if (password) {
            const hashedPassword = await hash(password, 10);
            updateData.password = hashedPassword;
        }

        // 角色更新操作 - 使用SQL
        if (roleIds !== undefined) {
            // 1. 删除现有角色关联
            await prisma.$executeRaw`
                DELETE FROM "UserRoles" WHERE "userId" = ${userId}
            `;

            // 2. 添加新角色关联
            if (roleIds.length > 0) {
                for (const roleId of roleIds) {
                    await prisma.$executeRaw`
                        INSERT INTO "UserRoles" ("id", "userId", "roleId", "createdAt")
                        VALUES (${crypto.randomUUID()}, ${userId}, ${roleId}, NOW())
                    `;
                }
            }
        }

        // 更新用户基础信息
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // 获取更新后的角色
        const updatedRoles = await prisma.$queryRaw`
            SELECT "UserRoles".id, "UserRoles"."roleId", "Role".name as "roleName", "Role".description
            FROM "UserRoles"
            JOIN "Role" ON "UserRoles"."roleId" = "Role".id
            WHERE "UserRoles"."userId" = ${userId}
        `;

        return NextResponse.json({
            ...updatedUser,
            roles: updatedRoles,
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