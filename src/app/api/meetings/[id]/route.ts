import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const session = await getServerSession(authOptions)

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        attendees: true,
        transcripts: {
          orderBy: { startTime: 'asc' }
        },
        summaries: true,
        actionItems: true
      }
    })
    
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Access Control
    const userId = (session?.user as any)?.id
    if (!meeting.isPublic && meeting.userId !== userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({
      meeting,
      isOwner: meeting.userId === userId,
      transcripts: meeting.transcripts,
      summaries: meeting.summaries,
      actionItems: meeting.actionItems
    })
  } catch (error) {
    console.error('Error fetching meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
