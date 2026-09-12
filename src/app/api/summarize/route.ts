import { NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'

export async function POST(request: Request) {
  try {
    const { meetingId, templateType } = await request.json()
    
    if (!meetingId || !templateType) {
      return NextResponse.json({ error: 'Missing meetingId or templateType' }, { status: 400 })
    }

    const data = await aiService.generateSummary(meetingId, templateType)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Summarization error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 })
  }
}
