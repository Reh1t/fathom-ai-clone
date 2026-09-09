import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key'
  })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob
    const meetingId = formData.get('meetingId') as string
    const startTimeStr = formData.get('startTime') as string
    
    if (!file || !meetingId) {
      return NextResponse.json({ error: 'Missing file or meetingId' }, { status: 400 })
    }

    const startTime = parseFloat(startTimeStr || '0')
    const endTime = startTime + 5.0 // 5 second chunks

    // Convert Blob to File object for Groq
    const audioFile = new File([file], 'chunk.webm', { type: 'audio/webm' })
    
    // Call Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
    })
    
    const text = transcription.text.trim()
    
    if (!text) {
      return NextResponse.json([]) // No speech detected
    }
    
    // Save to database
    // For MVP, we'll assign a generic speaker or try to guess. Let's just use "Speaker"
    const transcriptLine = await prisma.transcriptLine.create({
      data: {
        meetingId,
        speaker: "Speaker", 
        text,
        startTime,
        endTime
      }
    })
    
    return NextResponse.json([transcriptLine])
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
