import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Only process bot.done to prevent concurrent race conditions with bot.status_change
    const isDone = payload.event === 'bot.done'
                  
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
        }
        
        if (transcriptData && transcriptData.length > 0) {
          await prisma.transcriptLine.deleteMany({ where: { meetingId: meeting.id } })
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
          const words = segment.words || []
          
          if (!words.length && !segment.text) {
             continue; // empty
          }

          const getTimestamp = (wordTs: any, defaultTs: any) => {
            if (wordTs?.relative !== undefined) return wordTs.relative
            if (typeof wordTs === 'number') return wordTs
            if (defaultTs?.relative !== undefined) return defaultTs.relative
            if (typeof defaultTs === 'number') return defaultTs
            return 0
          }

          // If there are words, chunk them into max 15 second intervals for readability
          if (words.length > 0) {
            let currentChunkWords: any[] = []
            let chunkStartTime = getTimestamp(words[0].start_timestamp, 0)
            
            for (let i = 0; i < words.length; i++) {
              const w = words[i]
              currentChunkWords.push(w)
              
              const currentWordTime = getTimestamp(w.start_timestamp, 0)
              const isLastWord = i === words.length - 1
              const timeDiff = currentWordTime - chunkStartTime
              const nextWordTime = isLastWord ? 0 : getTimestamp(words[i+1].start_timestamp, 0)
              const isLongPause = !isLastWord && (nextWordTime - getTimestamp(w.end_timestamp, 0) > 2)

              // Break chunk if > 15 seconds, or if there is a long pause > 2s, or end of array
              if (timeDiff > 15 || isLongPause || isLastWord) {
                const text = currentChunkWords.map(cw => cw.text).join(' ').trim()
                if (text) {
                  const chunkEndTime = getTimestamp(currentChunkWords[currentChunkWords.length - 1].end_timestamp, 0)
                  await prisma.transcriptLine.create({
                    data: {
                      meetingId: meeting.id,
                      speaker: speakerName,
                      text,
                      startTime: chunkStartTime,
                      endTime: chunkEndTime
                    }
                  })
                }
                if (!isLastWord) {
                  chunkStartTime = getTimestamp(words[i+1].start_timestamp, 0)
                  currentChunkWords = []
                }
              }
            }
          } else {
             // Fallback if no word-level timestamps but text exists
             await prisma.transcriptLine.create({
               data: {
                 meetingId: meeting.id,
                 speaker: speakerName,
                 text: segment.text,
                 startTime: getTimestamp(segment.start_timestamp, 0),
                 endTime: getTimestamp(segment.end_timestamp, 0)
               }
             })
          }
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
