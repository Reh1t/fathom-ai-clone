import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingService } from '@/services/meeting.service'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { lineId } = await request.json()
    if (!lineId) return NextResponse.json({ error: 'Missing lineId' }, { status: 400 })
    
    const updated = await meetingService.toggleTranscriptHighlight(lineId, userId)

    return NextResponse.json({ success: true, isHighlighted: updated.isHighlighted })
  } catch (error: any) {
    console.error('Highlight toggle error:', error)
    if (error.message.includes('Not found or unauthorized')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to toggle highlight status' }, { status: 500 })
  }
}
