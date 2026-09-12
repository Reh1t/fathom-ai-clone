import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingService } from '@/services/meeting.service'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const resolvedParams = await params
    const { id } = resolvedParams
    
    const updated = await meetingService.toggleMeetingPrivacy(id, userId)

    return NextResponse.json({ success: true, isPublic: updated.isPublic })
  } catch (error: any) {
    console.error('Share toggle error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to toggle share status' }, { status: 500 })
  }
}
