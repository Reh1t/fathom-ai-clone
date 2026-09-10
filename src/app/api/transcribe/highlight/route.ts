import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { lineId } = await request.json()
    if (!lineId) return NextResponse.json({ error: 'Missing lineId' }, { status: 400 })
    
    const line = await prisma.transcriptLine.findUnique({ 
      where: { id: lineId },
      include: { meeting: true }
    })
    
    if (!line || line.meeting.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.transcriptLine.update({
      where: { id: lineId },
      data: { isHighlighted: !line.isHighlighted }
    })

    return NextResponse.json({ success: true, isHighlighted: updated.isHighlighted })
  } catch (error) {
    console.error('Highlight toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle highlight status' }, { status: 500 })
  }
}
