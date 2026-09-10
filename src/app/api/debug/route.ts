import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const botId = url.searchParams.get('botId')
  if (!botId) return NextResponse.json({ error: 'Missing botId' })

  const botRes = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${botId}`, {
    headers: { 'Authorization': `Token ${process.env.RECALL_API_KEY || ''}` }
  })
  const botData = await botRes.json()
  
  let transcriptData: any = null
  let transcriptUrl = ''

  if (botData.bot_recordings && botData.bot_recordings.length > 0) {
    transcriptUrl = botData.bot_recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
  } else if (botData.recordings && botData.recordings.length > 0) {
    transcriptUrl = botData.recordings[0]?.media_shortcuts?.transcript?.data?.download_url || ''
  }
  
  if (transcriptUrl) {
    const tRes = await fetch(transcriptUrl)
    if (tRes.ok) transcriptData = await tRes.json()
  }

  return NextResponse.json({ botData, transcriptUrl, transcriptData })
}
