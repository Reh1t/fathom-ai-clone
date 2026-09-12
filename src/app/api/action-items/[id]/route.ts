import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isCompleted } = await request.json()

    await prisma.actionItem.update({
      where: { id },
      data: { isCompleted }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating action item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
