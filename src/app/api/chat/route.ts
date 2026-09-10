import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { meetingId, question } = await request.json()

    if (!meetingId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        TranscriptLine: {
          orderBy: { startTime: 'asc' }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const transcriptText = meeting.TranscriptLine.map(line => `[${line.speaker}]: ${line.text}`).join('\n')

    if (!transcriptText.trim()) {
      return NextResponse.json({ reply: 'Sorry, I cannot answer questions about this meeting because there is no transcript available yet.' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
You are an AI assistant helping a user query their meeting recording.
Here is the transcript of the meeting titled "${meeting.title}":

${transcriptText}

The user asks: "${question}"
Please answer the user's question directly based on the transcript above. If the transcript does not contain the answer, politely say so.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ reply: text })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
