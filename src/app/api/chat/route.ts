import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })
    const { meetingId, question, history = [] } = await request.json()

    if (!meetingId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcripts: {
          orderBy: { startTime: 'asc' }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const transcriptText = meeting.transcripts.map((line: { speaker: string; text: string }) => `[${line.speaker}]: ${line.text}`).join('\n')

    if (!transcriptText.trim()) {
      return NextResponse.json({ reply: 'Sorry, I cannot answer questions about this meeting because there is no transcript available yet.' })
    }

    const systemInstruction = `
You are an AI assistant helping a user query their meeting recording.
Here is the transcript of the meeting titled "${meeting.title}":

${transcriptText}

Please answer the user's questions directly based on the transcript above. If the transcript does not contain the answer, politely say so.
`

    // Convert history to Gemini format
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to answer questions about this meeting.' }] },
    ]

    for (const msg of history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })
    }
    
    // Add the current question
    contents.push({ role: 'user', parts: [{ text: question }] })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
    })

    const text = response.text

    return NextResponse.json({ reply: text })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
