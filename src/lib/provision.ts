import prisma from '@/lib/db'
import { meetings } from '@/fixtures/meetings'
import { transcripts } from '@/fixtures/transcripts'
import { summaries, actionItems } from '@/fixtures/summaries'

export async function provisionDemoWorkspace(userId: string) {
  try {
    // Check if the user already has provisioned demo data
    const existingDemoMeeting = await prisma.meeting.findFirst({
      where: { userId, isDemo: true }
    })
    
    if (existingDemoMeeting) {
      return // Already provisioned
    }

    console.log(`Provisioning demo workspace for user ${userId}...`)

    const meetingIdMap = new Map<string, string>()

    for (const m of meetings) {
      const newMeeting = await prisma.meeting.create({
        data: {
          userId,
          title: m.title,
          date: new Date(m.date),
          duration: m.duration,
          status: m.status,
          mediaUrl: m.mediaUrl,
          isDemo: true,
          attendees: {
            create: m.attendees.map(a => ({
              name: a.name,
              avatar: a.avatar
            }))
          }
        }
      })
      meetingIdMap.set(m.id, newMeeting.id)
    }

    // Transcripts
    const transcriptData = transcripts
      .map(t => ({
        meetingId: meetingIdMap.get(t.meetingId)!,
        speaker: t.speaker,
        text: t.text,
        startTime: t.startTime,
        endTime: t.endTime
      }))
      .filter(t => t.meetingId)
    await prisma.transcriptLine.createMany({ data: transcriptData })

    // Summaries
    const summaryData = summaries
      .map(s => ({
        meetingId: meetingIdMap.get(s.meetingId)!,
        template: s.template,
        contentMarkdown: s.contentMarkdown
      }))
      .filter(s => s.meetingId)
    await prisma.summary.createMany({ data: summaryData })

    // Action Items
    const actionItemData = actionItems
      .map(a => ({
        meetingId: meetingIdMap.get(a.meetingId)!,
        task: a.task,
        assignee: a.assignee,
        isCompleted: a.isCompleted
      }))
      .filter(a => a.meetingId)
    await prisma.actionItem.createMany({ data: actionItemData })

    console.log(`Demo workspace provisioned for user ${userId}.`)
  } catch (error) {
    console.error("Error provisioning demo workspace:", error)
  }
}
