import { NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'

export async function POST(request: Request) {
  try {
    const { meetingId, question, history = [] } = await request.json()

    if (!meetingId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const reply = await aiService.chatWithMeeting(meetingId, question, history)

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 })
  }
}
