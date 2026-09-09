import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  // In production, you would verify a cron secret here
  // if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  try {
    const now = new Date()
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000)

    // Find upcoming meetings starting in the next ~5-10 minutes
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        status: 'upcoming',
        meetUrl: { not: null },
        recallId: null, // Not yet dispatched
        date: {
          lte: fiveMinsFromNow,
          gte: new Date(now.getTime() - 30 * 60000) // Look back 30 mins just in case
        }
      }
    })

    const dispatched = []

    for (const meeting of upcomingMeetings) {
      // Call MeetingBaas API
      const response = await fetch('https://api.meetingbaas.com/bots', {
        method: 'POST',
        headers: {
          'x-meeting-baas-api-key': process.env.MEETING_BAAS_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meeting_url: meeting.meetUrl,
          bot_name: 'Fathom AI Notetaker'
        })
      })

      if (response.ok) {
        const botData = await response.json()
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { recallId: botData.bot_id } // reusing recallId column for bot_id
        })
        dispatched.push(botData.bot_id)
      } else {
        console.error('Failed to dispatch bot:', await response.text())
      }
    }

    return NextResponse.json({ success: true, dispatched })
  } catch (error) {
    console.error('Dispatch error:', error)
    return NextResponse.json({ error: 'Failed to dispatch bots' }, { status: 500 })
  }
}
