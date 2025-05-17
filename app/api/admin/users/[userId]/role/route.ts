import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { RESTRICTED_ROLE_NAME } from '@/lib/constants';

// 只允许管理员访问的中间件
async function checkAdminAccess() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return false;
    }

    return true;
}

// 为用户添加受限角色
export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
        }

        const userId = params.userId;

        // 查找受限角色
        const restrictedRole = await prisma.role.findUnique({
            where: { name: RESTRICTED_ROLE_NAME }
        });

        if (!restrictedRole) {
            return NextResponse.json({ error: `${RESTRICTED_ROLE_NAME}角色不存在` }, { status: 404 });
        }

        // 检查关联是否已存在
        const existingUserRole = await prisma.userRoles.findFirst({
            where: {
                userId,
                roleId: restrictedRole.id
            }
        });

        if (existingUserRole) {
            return NextResponse.json({ message: `用户已拥有${RESTRICTED_ROLE_NAME}角色` });
        }

        // 创建用户-角色关联
        await prisma.userRoles.create({
            data: {
                userId,
                roleId: restrictedRole.id
            }
        });

        return NextResponse.json({ message: `已成功为用户添加${RESTRICTED_ROLE_NAME}角色` });
    } catch (error: any) {
        console.error('添加角色时出错:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 移除用户的受限角色
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // 检查管理员权限
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
        }

        const userId = params.userId;

        // 查找受限角色
        const restrictedRole = await prisma.role.findUnique({
            where: { name: RESTRICTED_ROLE_NAME }
        });

        if (!restrictedRole) {
            return NextResponse.json({ error: `${RESTRICTED_ROLE_NAME}角色不存在` }, { status: 404 });
        }

        // 删除用户-角色关联
        const result = await prisma.userRoles.deleteMany({
            where: {
                userId,
                roleId: restrictedRole.id
            }
        });

        if (result.count === 0) {
            return NextResponse.json({ message: `用户没有${RESTRICTED_ROLE_NAME}角色` });
        }

        return NextResponse.json({ message: `已成功移除用户的${RESTRICTED_ROLE_NAME}角色` });
    } catch (error: any) {
        console.error('移除角色时出错:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 