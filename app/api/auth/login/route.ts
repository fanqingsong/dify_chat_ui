import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 这里只是一个模拟的登录API，实际项目中应该连接到真实的后端服务
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // 简单的验证
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // 模拟的登录逻辑
        if (email === 'test@example.com' && password === 'password') {
            return NextResponse.json({
                user: {
                    id: '1',
                    username: 'Test User',
                    email: 'test@example.com',
                    avatar: ''
                },
                token: 'mock-jwt-token-' + Date.now()
            })
        }

        // 模拟的登录失败
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 