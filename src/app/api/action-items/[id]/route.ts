import { NextResponse } from 'next/server'
import { meetingService } from '@/services/meeting.service'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isCompleted } = await request.json()

    await meetingService.updateActionItem(id, isCompleted)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating action item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
