import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
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
    
    return NextResponse.json({
      meeting,
      transcripts: meeting.transcripts,
      summaries: meeting.summaries,
      actionItems: meeting.actionItems
    })
  } catch (error) {
    console.error('Error fetching meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
