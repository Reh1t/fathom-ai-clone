"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { VideoPlayer } from "./components/VideoPlayer"
import { TranscriptViewer } from "./components/TranscriptViewer"
import { InsightsPanel } from "./components/InsightsPanel"

interface MeetingClientProps {
  initialData: {
    meeting: any
    isOwner: boolean
    transcripts: any[]
    summaries: any[]
    actionItems: any[]
  }
  isLive: boolean
}

export function MeetingClient({ initialData, isLive }: MeetingClientProps) {
  const [meeting, setMeeting] = useState(initialData.meeting)
  const [fullTranscript, setFullTranscript] = useState(initialData.transcripts)
  const [meetingActionItems, setMeetingActionItems] = useState(initialData.actionItems)
  const [activeTemplate, setActiveTemplate] = useState("Standard")
  const [summaries, setSummaries] = useState(initialData.summaries)
  const [currentSummary, setCurrentSummary] = useState(initialData.summaries.find(s => s.template === "Standard"))
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (isLive) {
      const timer = setTimeout(async () => {
        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meeting.id })
        })
        if (res.ok) {
          window.location.replace(`/meeting/${meeting.id}`)
        }
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [meeting.id, isLive])

  const handleTemplateChange = async (val: string) => {
    setActiveTemplate(val)
    const existing = summaries.find(s => s.template === val)
    
    // If not generated yet, fetch
    if (!existing && val !== 'Chat' && val !== 'Highlights') {
      setIsGenerating(true)
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meeting.id, templateType: val })
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentSummary(data.summary)
          setSummaries(prev => [...prev, data.summary])
          if (data.actionItems) setMeetingActionItems(data.actionItems)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
    } else {
      setCurrentSummary(existing || null)
    }
  }

  const handleShare = async () => {
    const res = await fetch(`/api/meetings/${meeting.id}/share`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setMeeting({ ...meeting, isPublic: data.isPublic })
      navigator.clipboard.writeText(window.location.href)
      showToast(data.isPublic ? "Public link copied to clipboard!" : "Meeting is now private.")
    }
  }

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden flex-col md:flex-row font-sans">
      
      {/* Left Column (Video + Transcript) */}
      <div className="flex-1 flex flex-col border-r border-slate-200 h-full overflow-hidden relative">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-lg shadow-xl text-sm flex items-center font-medium">
            {toast}
          </div>
        )}
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-5">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">{meeting.title}</h1>
              <div className="flex items-center text-sm text-slate-500 font-medium gap-3 mt-0.5">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(meeting.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{meeting.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isLive && initialData.isOwner && (
              <Button 
                variant={meeting.isPublic ? "default" : "outline"} 
                className={meeting.isPublic ? "bg-sky-600 hover:bg-sky-700 text-white font-medium" : "border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"}
                onClick={handleShare}
              >
                {meeting.isPublic ? "Shared (Copy Link)" : "Share"}
              </Button>
            )}
            {isLive && (
              <Badge variant="outline" className="animate-pulse bg-sky-50 text-sky-700 border-sky-200 px-3 py-1 font-medium">
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin inline" />
                Simulating Capture
              </Badge>
            )}
          </div>
        </div>

        <VideoPlayer mediaUrl={meeting.mediaUrl} isLive={isLive} />
        
        <TranscriptViewer 
          transcripts={fullTranscript} 
          isLive={isLive} 
          isOwner={initialData.isOwner}
          onHighlightToggle={(lineId, isHighlighted) => {
            setFullTranscript(prev => prev.map(l => l.id === lineId ? { ...l, isHighlighted } : l))
          }}
        />
      </div>

      {/* Right Column */}
      <InsightsPanel 
        meetingId={meeting.id}
        isLive={isLive}
        transcripts={fullTranscript}
        actionItems={meetingActionItems}
        currentSummary={currentSummary}
        activeTemplate={activeTemplate}
        isGenerating={isGenerating}
        onTemplateChange={handleTemplateChange}
        onActionItemToggle={(itemId, checked) => {
          setMeetingActionItems(prev => prev.map(a => a.id === itemId ? { ...a, isCompleted: checked } : a))
        }}
      />
    </div>
  )
}
