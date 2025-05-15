import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// 紧急接口 - 让当前登录用户成为管理员
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '未登录，请先登录' },
                { status: 401 }
            );
        }

        // 更新当前用户为管理员
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { isAdmin: true }
        });

        return NextResponse.json({
            message: '当前用户已设置为管理员',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin
            }
        });
    } catch (error: any) {
        console.error('设置管理员错误:', error);
        return NextResponse.json(
            { error: error.message || '设置管理员失败' },
            { status: 500 }
        );
    }
} 