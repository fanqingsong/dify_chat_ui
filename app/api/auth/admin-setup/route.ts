import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'

// 初始管理员设置 API
export async function POST(req: Request) {
    try {
        const { email, password, adminSecretKey } = await req.json()

        // 验证管理员密钥 - 这应该是一个环境变量中的秘钥
        // 在生产环境中，请使用环境变量存储此密钥
        const DEFAULT_ADMIN_SECRET = 'admin-setup-123456'
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_SECRET

        if (adminSecretKey !== ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { error: '无效的管理员密钥' },
                { status: 403 }
            )
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        let user

        if (existingUser) {
            // 如果用户存在，则更新为管理员
            user = await prisma.user.update({
                where: { email },
                data: {
                    isAdmin: true,
                    isActive: true
                }
            })
        } else {
            // 如果用户不存在，创建新管理员
            const hashedPassword = await hash(password, 10)

            user = await prisma.user.create({
                data: {
                    name: email,
                    email,
                    password: hashedPassword,
                    isAdmin: true,
                    isActive: true
                }
            })
        }

        // 返回用户数据（不包含密码）
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            message: '管理员账户设置成功'
        })
    } catch (error) {
        console.error('管理员设置错误:', error)
        return NextResponse.json(
            { error: '管理员账户设置过程中出错' },
            { status: 500 }
        )
    }
} 