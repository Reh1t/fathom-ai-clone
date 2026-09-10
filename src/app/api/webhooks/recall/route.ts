import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Accept both 'bot.done' and 'bot.status_change' with 'done' just in case their JSON mapping differs from the UI
    const isDone = payload.event === 'bot.done' || 
                  (payload.event === 'bot.status_change' && payload.data?.status?.code === 'done')
                  
    if (isDone) {
      const botId = payload.data?.bot_id || payload.bot_id
      
      const meeting = await prisma.meeting.findUnique({ where: { recallId: botId } })
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

      // Mark meeting as recorded and save video URL
      const videoUrl = payload.data?.video_url || null
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'recorded', mediaUrl: videoUrl }
      })

      // Fetch transcript from Recall.ai
      const response = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${botId}/transcript`, {
        headers: {
          'Authorization': `Token ${process.env.RECALL_API_KEY || ''}`
        }
      })
      
      if (response.ok) {
        const transcriptData = await response.json()
        
        // Recall.ai returns an array of transcript segments
        for (const segment of transcriptData) {
          await prisma.transcriptLine.create({
            data: {
              meetingId: meeting.id,
              speaker: segment.speaker || 'Unknown',
              text: segment.words?.map((w: any) => w.text).join(' ') || segment.text || '',
              startTime: segment.words?.[0]?.start_timestamp || 0,
              endTime: segment.words?.[segment.words.length - 1]?.end_timestamp || 0
            }
          })
        }

        // Immediately invoke our Gemini summarizer
        await fetch(`${process.env.NEXTAUTH_URL}/api/summarize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meeting.id, templateType: 'Standard' })
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
