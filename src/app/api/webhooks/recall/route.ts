import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Accept both 'bot.done' and 'bot.status_change' with 'done' just in case their JSON mapping differs from the UI
    const isDone = payload.event === 'bot.done' || 
                  (payload.event === 'bot.status_change' && payload.data?.status?.code === 'done')
                  
    if (isDone) {
      // The payload structure is payload.data.bot.id for 'bot.done'
      const botId = payload.data?.bot?.id || payload.data?.bot_id || payload.bot_id
      
      if (!botId) return NextResponse.json({ error: 'Missing bot ID in payload' }, { status: 400 })

      const meeting = await prisma.meeting.findUnique({ where: { recallId: botId } })
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

      // Fetch full bot details from Recall.ai to get the video URL and transcript shortcut URL
      const botRes = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${botId}`, {
        headers: { 'Authorization': `Token ${process.env.RECALL_API_KEY || ''}` }
      })
      
      if (botRes.ok) {
        const botData = await botRes.json()
        
        let transcriptData: any[] = []
        let transcriptUrl = ''
        let videoUrl = ''

        // Find the download URL in bot_recordings or recordings
        if (botData.bot_recordings && botData.bot_recordings.length > 0) {
          transcriptUrl = botData.bot_recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
          videoUrl = botData.bot_recordings[0]?.media_shortcuts?.video_mixed?.data?.download_url || ''
        } else if (botData.recordings && botData.recordings.length > 0) {
          transcriptUrl = botData.recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
          videoUrl = botData.recordings[0]?.media_shortcuts?.video_mixed?.data?.download_url || ''
        }

        // Mark meeting as recorded and save video URL from the bot data
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: 'recorded', mediaUrl: videoUrl || null }
        })
        
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
          // The streaming transcript format has speaker name inside participant.name
          const speakerName = segment.participant?.name || segment.speaker || segment.name || 'Unknown'
          const text = segment.words?.map((w: any) => w.text).join(' ') || segment.text || ''
          
          if (!text.trim()) continue;

          // The streaming transcript format has timestamps as objects with 'relative' and 'absolute' fields
          const firstWord = segment.words?.[0]
          const lastWord = segment.words?.[segment.words.length - 1]
          
          const getTimestamp = (wordTs: any, segmentTs: any) => {
            if (wordTs?.relative !== undefined) return wordTs.relative
            if (typeof wordTs === 'number') return wordTs
            if (segmentTs?.relative !== undefined) return segmentTs.relative
            if (typeof segmentTs === 'number') return segmentTs
            return 0
          }

          await prisma.transcriptLine.create({
            data: {
              meetingId: meeting.id,
              speaker: speakerName,
              text,
              startTime: getTimestamp(firstWord?.start_timestamp, segment.start_timestamp),
              endTime: getTimestamp(lastWord?.end_timestamp, segment.end_timestamp)
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
