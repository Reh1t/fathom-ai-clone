import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  // Note: Ensure the API key is set in your environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' })

  try {
    const { meetingId, templateType } = await request.json()
    
    if (!meetingId || !templateType) {
      return NextResponse.json({ error: 'Missing meetingId or templateType' }, { status: 400 })
    }

    // Fetch the full transcript from the DB
    const transcripts = await prisma.transcriptLine.findMany({
      where: { meetingId },
      orderBy: { startTime: 'asc' }
    })
    
    if (transcripts.length === 0) {
      return NextResponse.json({ error: 'No transcript found for this meeting.' }, { status: 400 })
    }
    
    const fullText = transcripts.map(t => `[${t.startTime}s - ${t.endTime}s] ${t.speaker}: ${t.text}`).join('\n')
    
    let prompt = `You are an expert AI meeting assistant. Analyze the following meeting transcript and provide a structured summary.\n\nTranscript:\n${fullText}\n\n`
    
    if (templateType === 'Executive') {
      prompt += "Provide an Executive Summary focusing on the high-level goals, status, and next steps."
    } else if (templateType === 'ActionItems') {
      prompt += "Focus primarily on extracting all action items and tasks discussed."
    } else {
      prompt += "Provide a standard comprehensive summary of the key discussion points."
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            executiveSummary: {
              type: "STRING",
              description: "A concise overview highlighting key themes and strategic decisions in markdown format."
            },
            keyDecisions: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "A list of key decisions made during the meeting."
            },
            actionItems: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  task: { type: "STRING" },
                  assignee: { type: "STRING", description: "The person assigned to the task, or 'Unassigned'" }
                },
                required: ["task", "assignee"]
              }
            }
          },
          required: ["executiveSummary", "keyDecisions", "actionItems"]
        }
      }
    })

    const resultText = response.text
    if (!resultText) throw new Error("No response text")
    
    const parsedData = JSON.parse(resultText)
    
    // Format into markdown for the summary panel
    let contentMarkdown = `${parsedData.executiveSummary}\n\n`
    if (parsedData.keyDecisions.length > 0) {
      contentMarkdown += `### Key Decisions\n`
      parsedData.keyDecisions.forEach((d: string) => contentMarkdown += `- ${d}\n`)
    }

    // Save summary to DB (upsert)
    const summary = await prisma.summary.upsert({
      where: {
        meetingId_template: {
          meetingId,
          template: templateType
        }
      },
      update: {
        contentMarkdown
      },
      create: {
        meetingId,
        template: templateType,
        contentMarkdown
      }
    })

    // Save action items to DB
    const savedActionItems = []
    if (parsedData.actionItems && parsedData.actionItems.length > 0) {
      // Clear old action items for simplicity in this MVP, or just append
      // We'll just delete existing ones and recreate to avoid duplicates on re-generation
      await prisma.actionItem.deleteMany({ where: { meetingId } })
      
      for (const item of parsedData.actionItems) {
        const ai = await prisma.actionItem.create({
          data: {
            meetingId,
            task: item.task,
            assignee: item.assignee,
            isCompleted: false
          }
        })
        savedActionItems.push(ai)
      }
    }

    return NextResponse.json({ summary, actionItems: savedActionItems })
  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
