import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'
import { aiService } from '@/services/ai.service'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meetingId, question, history = [] } = await request.json()

    if (!meetingId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    if (meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reply = await aiService.chatWithMeeting(meetingId, question, history)

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 })
  }
}
