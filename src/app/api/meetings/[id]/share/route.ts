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
    
    let isPublic = false
    try {
      const body = await request.json()
      if (body.forcePublic) {
        // Need prisma to force update, but let's just do it directly here
        const { default: prisma } = await import('@/lib/db')
        const meeting = await prisma.meeting.update({
          where: { id, userId },
          data: { isPublic: true }
        })
        isPublic = meeting.isPublic
      } else {
        const updated = await meetingService.toggleMeetingPrivacy(id, userId)
        isPublic = updated.isPublic
      }
    } catch (e) {
      // If no body or error parsing, fallback to standard toggle
      const updated = await meetingService.toggleMeetingPrivacy(id, userId)
      isPublic = updated.isPublic
    }

    return NextResponse.json({ success: true, isPublic })
  } catch (error: any) {
    console.error('Share toggle error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to toggle share status' }, { status: 500 })
  }
}
