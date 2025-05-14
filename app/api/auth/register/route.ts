import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'

// 这里只是一个模拟的注册API，实际项目中应该连接到真实的后端服务
export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        // 验证输入
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: '缺少必要的字段' },
                { status: 400 }
            )
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '邮箱已被注册' },
                { status: 409 }
            )
        }

        // 密码加密
        const hashedPassword = await hash(password, 10)

        // 创建用户
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        // 返回用户数据（不包含密码）
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        })
    } catch (error) {
        console.error('注册错误:', error)
        return NextResponse.json(
            { error: '注册过程中出错' },
            { status: 500 }
        )
    }
} 