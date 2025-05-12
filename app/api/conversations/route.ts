import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 返回模拟的对话列表
    return NextResponse.json({
      data: [
        {
          id: 'conv_1',
          name: '示例对话 1',
          inputs: {},
          introduction: '这是第一个示例对话',
          created_at: new Date().toISOString()
        },
        {
          id: 'conv_2',
          name: '示例对话 2',
          inputs: {},
          introduction: '这是第二个示例对话',
          created_at: new Date(Date.now() - 3600000).toISOString() // 1小时前
        }
      ],
      has_more: false,
      limit: 100
    })
  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
