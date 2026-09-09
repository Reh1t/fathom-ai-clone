import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Recall.ai sends various events. We care about 'bot.status_change' -> 'done'
    if (payload.event === 'bot.status_change' && payload.data.status.code === 'done') {
      const botId = payload.data.bot_id
      
      const meeting = await prisma.meeting.findUnique({ where: { recallId: botId } })
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

      // Fetch the transcript from Recall.ai
      const response = await fetch(`https://us-west-2.recall.ai/api/v1/bot/${botId}/transcript`, {
        headers: {
          'Authorization': `Token ${process.env.RECALL_API_KEY}`
        }
      })
      
      if (!response.ok) return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
      
      const transcriptData = await response.json()
      // transcriptData typically contains an array of words/segments. 
      // Simplified: Assume it's an array of speaker segments
      for (const segment of transcriptData) {
        await prisma.transcriptLine.create({
          data: {
            meetingId: meeting.id,
            speaker: segment.speaker || 'Unknown',
            text: segment.text,
            startTime: segment.start_timestamp,
            endTime: segment.end_timestamp
          }
        })
      }

      // Mark meeting as recorded
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'recorded' }
      })

      // Optionally, we could immediately invoke our Gemini summarizer here:
      await fetch(`${process.env.NEXTAUTH_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id, templateType: 'Standard' })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
