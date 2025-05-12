import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 这里只是一个模拟的获取用户信息API，实际项目中应该连接到真实的后端服务
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')

        // 验证token
        if (!token || !token.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 模拟的获取用户信息逻辑
        // 在真实环境中，这里应该根据token获取对应的用户信息
        return NextResponse.json({
            user: {
                id: '1',
                username: 'Test User',
                email: 'test@example.com',
                avatar: ''
            },
            token: token.split(' ')[1]
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 