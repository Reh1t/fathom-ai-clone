import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const resolvedParams = await params
    const { id } = resolvedParams
    
    const meeting = await prisma.meeting.findUnique({ where: { id } })
    if (!meeting || meeting.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: { isPublic: !meeting.isPublic }
    })

    return NextResponse.json({ success: true, isPublic: updated.isPublic })
  } catch (error) {
    console.error('Share toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle share status' }, { status: 500 })
  }
}
