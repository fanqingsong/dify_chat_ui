import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    // 解析请求体和参数
    const body = await request.json()
    const { auto_generate, name } = body

    // 先await params对象，然后再访问其属性
    const resolvedParams = await params;
    const conversationId = resolvedParams.conversationId;

    // 获取用户信息
    const { user } = getInfo(request)

    // 检查是否有有效的客户端和对话ID
    if (!conversationId) {
      return NextResponse.json(
        { error: '对话ID不能为空' },
        { status: 400 }
      )
    }

    console.log('尝试重命名对话:', {
      conversationId,
      name,
      user,
      auto_generate
    })

    // 重命名对话
    try {
      const { data } = await client.renameConversation(conversationId, name, user, auto_generate)
      return NextResponse.json(data)
    } catch (error: any) {
      console.error('重命名对话出错:', error.message)

      // 如果是404错误，可能是API不支持或认证问题
      if (error.response?.status === 404) {
        console.error('API端点不存在或认证失败，检查您的API设置')
        return NextResponse.json(
          { error: 'API端点不存在或认证失败，检查您的API设置' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message || '重命名对话时出错' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('处理请求时出错:', error)
    return NextResponse.json(
      { error: error.message || '处理请求时出错' },
      { status: 500 }
    )
  }
}
