import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 返回模拟数据
    return NextResponse.json({
      user_input_form: [], // 空的用户输入表单
      opening_statement: "欢迎使用 Dify Chat UI！这是一个示例对话应用。", // 开场白
      file_upload: {
        image: {
          enabled: false,
          number_limits: 5,
          detail: "high",
          transfer_methods: ["local_file"]
        }
      },
      system_parameters: {
        system_parameters: 15728640 // 15MB
      },
      account: {
        id: "account_id",
        name: "Demo User",
        email: "demo@example.com"
      }
    })
  }
  catch (error) {
    console.error('Parameters API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application parameters' },
      { status: 500 }
    )
  }
}
