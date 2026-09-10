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

      // Fetch full bot details from Recall.ai to get the transcript shortcut URL
      const botRes = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${botId}`, {
        headers: { 'Authorization': `Token ${process.env.RECALL_API_KEY || ''}` }
      })
      
      if (botRes.ok) {
        const botData = await botRes.json()
        
        // recallai_streaming provides the transcript in botData.video_url's associated recording object
        // Usually found in botData.bot_recordings or just by iterating recordings? Wait, wait.
        // Actually, we can just grab the transcript URL from the first recording that has it.
        // But what if it's not ready yet? Wait.
        // Let's just try fetching it from the transcript endpoint as a fallback, AND check media_shortcuts.
        // The safest way is to hit the media_shortcuts endpoint.
        
        let transcriptData: any[] = []
        let transcriptUrl = ''

        // Find the download URL in bot_recordings
        if (botData.bot_recordings && botData.bot_recordings.length > 0) {
          transcriptUrl = botData.bot_recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
        } else if (botData.recordings && botData.recordings.length > 0) {
          transcriptUrl = botData.recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
        }
        
        if (transcriptUrl) {
          const tRes = await fetch(transcriptUrl)
          if (tRes.ok) {
            transcriptData = await tRes.json()
          }
        } else {
           // Fallback to older transcript API
           const response = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${botId}/transcript`, {
             headers: { 'Authorization': `Token ${process.env.RECALL_API_KEY || ''}` }
           })
           if (response.ok) {
             transcriptData = await response.json()
           }
        }
        
        // Recall.ai returns an array of transcript segments
        for (const segment of transcriptData) {
          await prisma.transcriptLine.create({
            data: {
              meetingId: meeting.id,
              speaker: segment.speaker || segment.name || 'Unknown',
              text: segment.words?.map((w: any) => w.text).join(' ') || segment.text || '',
              startTime: segment.words?.[0]?.start_timestamp || segment.start_timestamp || 0,
              endTime: segment.words?.[segment.words.length - 1]?.end_timestamp || segment.end_timestamp || 0
            }
          })
        }

        // Immediately invoke our Gemini summarizer if we got a transcript
        if (transcriptData.length > 0) {
          await fetch(`${process.env.NEXTAUTH_URL}/api/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: meeting.id, templateType: 'Standard' })
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
