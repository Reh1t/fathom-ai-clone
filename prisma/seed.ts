import { PrismaClient } from '@prisma/client'
import { meetings } from '../src/fixtures/meetings'
import { transcripts } from '../src/fixtures/transcripts'
import { summaries, actionItems } from '../src/fixtures/summaries'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)
  
  // Clear existing data
  await prisma.actionItem.deleteMany()
  await prisma.summary.deleteMany()
  await prisma.transcriptLine.deleteMany()
  await prisma.attendee.deleteMany()
  await prisma.meeting.deleteMany()

  for (const m of meetings) {
    const meeting = await prisma.meeting.create({
      data: {
        id: m.id,
        title: m.title,
        date: new Date(m.date),
        duration: m.duration,
        status: m.status,
        mediaUrl: m.mediaUrl,
        attendees: {
          create: m.attendees.map(a => ({
            name: a.name,
            avatar: a.avatar
          }))
        }
      }
    })
    console.log(`Created meeting with id: ${meeting.id}`)
  }

  for (const t of transcripts) {
    await prisma.transcriptLine.create({
      data: {
        id: t.id,
        meetingId: t.meetingId,
        speaker: t.speaker,
        text: t.text,
        startTime: t.startTime,
        endTime: t.endTime
      }
    })
  }
  console.log(`Seeded transcripts`)

  for (const s of summaries) {
    await prisma.summary.create({
      data: {
        meetingId: s.meetingId,
        template: s.template,
        contentMarkdown: s.contentMarkdown
      }
    })
  }
  console.log(`Seeded summaries`)

  for (const a of actionItems) {
    await prisma.actionItem.create({
      data: {
        id: a.id,
        meetingId: a.meetingId,
        task: a.task,
        assignee: a.assignee,
        isCompleted: a.isCompleted
      }
    })
  }
  console.log(`Seeded action items`)

  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
