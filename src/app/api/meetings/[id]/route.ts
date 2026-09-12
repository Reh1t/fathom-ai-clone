import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingService } from '@/services/meeting.service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'

    const data = await meetingService.getMeetingById(id, userId)
    
    if (!data) {
      return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
