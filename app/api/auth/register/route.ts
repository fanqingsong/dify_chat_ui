import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 这里只是一个模拟的注册API，实际项目中应该连接到真实的后端服务
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, email, password } = body

        // 简单的验证
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email and password are required' },
                { status: 400 }
            )
        }

        // 模拟的注册逻辑
        // 在真实环境中，这里应该检查邮箱是否已被注册等
        return NextResponse.json({
            user: {
                id: Date.now().toString(),
                username,
                email,
                avatar: ''
            },
            token: 'mock-jwt-token-' + Date.now()
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 