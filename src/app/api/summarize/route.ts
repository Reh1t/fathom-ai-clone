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

    const { meetingId, templateType } = await request.json()
    
    if (!meetingId || !templateType) {
      return NextResponse.json({ error: 'Missing meetingId or templateType' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    if (meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await aiService.generateSummary(meetingId, templateType)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Summarization error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 })
  }
}
