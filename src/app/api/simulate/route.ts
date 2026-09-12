import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // To provide a flawless deterministic simulation even for real synced calendar events,
    // we inject a realistic transcript and summary right now.
    const { transcripts } = await import('@/fixtures/transcripts')
    const { summaries, actionItems } = await import('@/fixtures/summaries')

    // Copy "m2" (Product Roadmap) data to this meeting
    const m2Transcripts = transcripts.filter(t => t.meetingId === 'm2')
    const m2Summaries = summaries.filter(s => s.meetingId === 'm2')
    const m2ActionItems = actionItems.filter(a => a.meetingId === 'm2')

    // Create transcripts
    await prisma.transcriptLine.createMany({
      data: m2Transcripts.map(t => ({
        meetingId,
        speaker: t.speaker,
        text: t.text,
        startTime: t.startTime,
        endTime: t.endTime
      })),
      skipDuplicates: true
    })

    // Create summaries
    await prisma.summary.createMany({
      data: m2Summaries.map(s => ({
        meetingId,
        template: s.template,
        contentMarkdown: s.contentMarkdown
      })),
      skipDuplicates: true
    })

    // Create action items
    await prisma.actionItem.createMany({
      data: m2ActionItems.map(a => ({
        meetingId,
        task: a.task,
        assignee: a.assignee,
        isCompleted: a.isCompleted
      })),
      skipDuplicates: true
    })

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'recorded' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
