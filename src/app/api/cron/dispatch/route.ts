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
      // Call Recall.ai API (using ap-northeast-1 region)
      const response = await fetch('https://ap-northeast-1.recall.ai/api/v1/bot', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.RECALL_API_KEY || ''}`,
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
          data: { recallId: botData.id } 
        })
        dispatched.push(botData.id)
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
