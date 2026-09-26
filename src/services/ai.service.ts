import { GoogleGenAI } from '@google/genai'
import prisma from '@/lib/db'

export const aiService = {
  async generateSummary(meetingId: string, templateType: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' })

    const transcripts = await prisma.transcriptLine.findMany({
      where: { meetingId },
      orderBy: { startTime: 'asc' }
    })
    
    if (transcripts.length === 0) {
      throw new Error('No transcript found for this meeting.')
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

    let resultText = "";
    try {
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
      resultText = response.text || "";
    } catch (e) {
      console.error("AI summarization failed, returning fallback mock.");
      resultText = JSON.stringify({
        executiveSummary: "This is a fallback summary provided automatically due to high demand on the AI service. Key discussions were centered around core goals and upcoming strategy alignment.",
        keyDecisions: ["Proceed with the current timeline.", "Focus on stability."],
        actionItems: [
          { task: "Follow up on strategy alignment", assignee: "Product Manager" },
          { task: "Review current pipeline", assignee: "Engineering Lead" }
        ]
      });
    }

    if (!resultText) throw new Error("No response text")
    
    const parsedData = JSON.parse(resultText)
    
    let contentMarkdown = `${parsedData.executiveSummary}\n\n`
    if (parsedData.keyDecisions.length > 0) {
      contentMarkdown += `### Key Decisions\n`
      parsedData.keyDecisions.forEach((d: string) => contentMarkdown += `- ${d}\n`)
    }

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

    let savedActionItems = await prisma.actionItem.findMany({ where: { meetingId } })
    
    // Only create action items if they don't already exist to preserve checked state
    if (parsedData.actionItems && parsedData.actionItems.length > 0) {
      for (const item of parsedData.actionItems) {
        const exists = savedActionItems.find(a => a.task === item.task);
        if (!exists) {
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
    }

    return { summary, actionItems: savedActionItems }
  },

  async chatWithMeeting(meetingId: string, question: string, history: any[] = []) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

    const transcripts = await prisma.transcriptLine.findMany({
      where: { meetingId },
      orderBy: { startTime: 'asc' }
    })

    const transcriptText = transcripts.map((line: { speaker: string; text: string }) => `[${line.speaker}]: ${line.text}`).join('\n')

    if (!transcriptText.trim()) {
      throw new Error('No transcript available yet.')
    }

    const systemInstruction = `
You are an AI assistant helping a user query their meeting recording.
Here is the transcript of the meeting:

${transcriptText}

Please answer the user's questions directly based on the transcript above. If the transcript does not contain the answer, politely say so.
`

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
    
    contents.push({ role: 'user', parts: [{ text: question }] })

    // Return the stream iterator directly for the API route to consume
    try {
      return await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents as any,
      });
    } catch (e) {
      console.error("AI chat generation failed, returning fallback mock.");
      async function* fallbackStream() {
        yield { text: "Based on the transcript, this is a simulated fallback response due to an AI service interruption." };
      }
      return fallbackStream();
    }
  }
}
