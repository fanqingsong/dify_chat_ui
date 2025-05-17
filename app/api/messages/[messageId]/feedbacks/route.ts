import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: { messageId: string }
}) {
  const body = await request.json()
  const {
    rating,
  } = body

  // 先await params对象，然后再访问其属性
  const resolvedParams = await params;
  const messageId = resolvedParams.messageId;

  const { user } = getInfo(request)
  const { data } = await client().messageFeedback(messageId, rating, user)
  return NextResponse.json(data)
}
