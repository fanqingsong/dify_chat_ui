import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 这里只是一个模拟的登出API，实际项目中应该连接到真实的后端服务
export async function POST(request: NextRequest) {
    try {
        // 模拟的登出逻辑
        // 在真实环境中，这里应该撤销token、清除session等
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 