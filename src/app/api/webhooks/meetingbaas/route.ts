import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // MeetingBaas webhook event payload typically sends a "bot.completed" or similar with the transcript directly
    if (payload.event === 'bot.completed' || (payload.event === 'bot.status_change' && payload.data?.status === 'completed')) {
      const botId = payload.data?.bot_id || payload.bot_id
      
      const meeting = await prisma.meeting.findUnique({ where: { recallId: botId } })
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

      // MeetingBaas often sends the transcript directly in the payload, or we fetch it:
      // Assuming transcript is included or we use their endpoint:
      let transcriptData = payload.data?.transcript || payload.transcript
      
      if (!transcriptData) {
        // Fetch transcript if not in webhook payload
        const response = await fetch(`https://api.meetingbaas.com/bots/${botId}/transcript`, {
          headers: {
            'x-meeting-baas-api-key': process.env.MEETING_BAAS_API_KEY || ''
          }
        })
        if (!response.ok) return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
        const resJson = await response.json()
        transcriptData = resJson.transcript || resJson.data || resJson
      }
      
      // Map MeetingBaas diarized text format
      for (const segment of transcriptData) {
        await prisma.transcriptLine.create({
          data: {
            meetingId: meeting.id,
            speaker: segment.speaker || 'Unknown',
            text: segment.text || segment.words?.map((w: any) => w.text).join(' '),
            startTime: segment.start_timestamp || segment.start,
            endTime: segment.end_timestamp || segment.end
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
