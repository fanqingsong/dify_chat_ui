import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// 只允许管理员访问的中间件
async function checkAdminAccess() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return false;
    }

    return true;
}

// 获取单个角色
export async function GET(
    request: NextRequest,
    { params }: { params: { roleId: string } }
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

        const { roleId } = params;

        // 获取角色
        const role = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!role) {
            return NextResponse.json(
                { error: '未找到角色' },
                { status: 404 }
            );
        }

        return NextResponse.json(role);
    } catch (error: any) {
        console.error('获取角色错误:', error);
        return NextResponse.json(
            { error: error.message || '获取角色失败' },
            { status: 500 }
        );
    }
}

// 更新角色
export async function PUT(
    request: NextRequest,
    { params }: { params: { roleId: string } }
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

        const { roleId } = params;
        const { name, description, isActive } = await request.json();

        // 验证输入
        if (!name) {
            return NextResponse.json(
                { error: '角色名称不能为空' },
                { status: 400 }
            );
        }

        // 检查角色是否存在
        const existingRole = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!existingRole) {
            return NextResponse.json(
                { error: '未找到角色' },
                { status: 404 }
            );
        }

        // 如果更改了名称，检查是否与其他角色冲突
        if (name !== existingRole.name) {
            const nameConflict = await prisma.role.findFirst({
                where: {
                    name,
                    id: { not: roleId }
                }
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: '角色名称已存在' },
                    { status: 409 }
                );
            }
        }

        // 更新角色
        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: {
                name,
                description,
                isActive
            }
        });

        return NextResponse.json(updatedRole);
    } catch (error: any) {
        console.error('更新角色错误:', error);
        return NextResponse.json(
            { error: error.message || '更新角色失败' },
            { status: 500 }
        );
    }
}

// 删除角色
export async function DELETE(
    request: NextRequest,
    { params }: { params: { roleId: string } }
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

        const { roleId } = params;

        // 检查角色是否存在
        const existingRole = await prisma.role.findUnique({
            where: { id: roleId },
            include: { users: true }
        });

        if (!existingRole) {
            return NextResponse.json(
                { error: '未找到角色' },
                { status: 404 }
            );
        }

        // 检查是否有用户正在使用此角色
        if (existingRole.users.length > 0) {
            return NextResponse.json(
                { error: '无法删除已分配给用户的角色' },
                { status: 400 }
            );
        }

        // 删除角色
        await prisma.role.delete({
            where: { id: roleId }
        });

        return NextResponse.json({ success: true, message: '角色已删除' });
    } catch (error: any) {
        console.error('删除角色错误:', error);
        return NextResponse.json(
            { error: error.message || '删除角色失败' },
            { status: 500 }
        );
    }
} 