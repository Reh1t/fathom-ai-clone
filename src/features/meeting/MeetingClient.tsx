"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Clock, ArrowLeft, Loader2, Star, Bookmark, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { usePlayerStore } from "@/store/player-store"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const tParam = searchParams.get('t')
  const clipParam = searchParams.get('clip')
  
  useEffect(() => {
    if (tParam) {
      const time = parseFloat(tParam)
      if (!isNaN(time)) {
        usePlayerStore.getState().seekTo(time)
      }
    }
  }, [tParam])
  
  const [meeting, setMeeting] = useState(initialData.meeting)
  const [fullTranscript, setFullTranscript] = useState(initialData.transcripts)
  const [meetingActionItems, setMeetingActionItems] = useState(initialData.actionItems)
  const [activeTemplate, setActiveTemplate] = useState("Standard")
  const [summaries, setSummaries] = useState(initialData.summaries)
  const [currentSummary, setCurrentSummary] = useState(initialData.summaries.find(s => s.template === "Standard"))
  const [isGenerating, setIsGenerating] = useState(false)

  // Live Companion Simulation State
  const [isSimulationActive, setIsSimulationActive] = useState(isLive)
  const [visibleLineCount, setVisibleLineCount] = useState(1)

  useEffect(() => {
    if (!isSimulationActive) return;
    if (visibleLineCount >= initialData.transcripts.length) return;
    
    const currentLine = initialData.transcripts[visibleLineCount - 1];
    const nextLine = initialData.transcripts[visibleLineCount];
    
    // Dynamic delay: Minimum 1500ms, scaling with character count up to 4500ms
    const delay = Math.min(Math.max(1500, currentLine.text.length * 40), 4500);
    
    const timer = setTimeout(() => {
      setVisibleLineCount(prev => prev + 1);
      // Advance clock to sync the synthetic video player UI and subtitles
      usePlayerStore.getState().setCurrentTime(nextLine.startTime);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isSimulationActive, visibleLineCount, initialData.transcripts]);

  const endSimulation = async () => {
    setIsSimulationActive(false);
    usePlayerStore.getState().setCurrentTime(0); // Reset for playback
    
    // Fire generation in background
    fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId: meeting.id })
    });
    
    toast.success("Meeting ended. Generating AI summaries in the background!");
    router.replace(`/meeting/${meeting.id}`);
  };

  const handleLiveTag = async (tagType: string) => {
    const activeLine = initialData.transcripts[visibleLineCount - 1];
    if (!activeLine) return;
    
    try {
      const res = await fetch('/api/transcribe/highlight', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ lineId: activeLine.id })
      });
      if (res.ok) {
        setFullTranscript(prev => prev.map(l => l.id === activeLine.id ? { ...l, isHighlighted: true } : l));
        toast.success(`${tagType} captured at ${Math.floor(activeLine.startTime / 60)}:${Math.floor(activeLine.startTime % 60).toString().padStart(2, '0')}`);
      } else {
        throw new Error("API failed");
      }
    } catch (e) {
      toast.error(`Failed to capture ${tagType}.`);
    }
  };

  const visibleTranscripts = isSimulationActive ? fullTranscript.slice(0, visibleLineCount) : fullTranscript;

  const handleTemplateChange = async (val: string) => {
    setActiveTemplate(val)
    const existing = summaries.find(s => s.template === val)
    
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
        toast.error("Failed to generate summary.")
      } finally {
        setIsGenerating(false)
      }
    } else {
      setCurrentSummary(existing || null)
    }
  }

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/share`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMeeting({ ...meeting, isPublic: data.isPublic })
        navigator.clipboard.writeText(window.location.href)
        toast.success(data.isPublic ? "Public link copied to clipboard!" : "Meeting is now private.")
      } else {
        toast.error("Failed to update sharing settings.")
      }
    } catch (e) {
      toast.error("An error occurred while sharing.")
    }
  }

  const handleShareClip = async (line: any) => {
    try {
      await fetch(`/api/meetings/${meeting.id}/share`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forcePublic: true }) 
      })
      setMeeting({ ...meeting, isPublic: true })
      
      const url = new URL(window.location.origin + `/meeting/${meeting.id}`)
      url.searchParams.set('t', Math.floor(line.startTime).toString())
      url.searchParams.set('clip', line.id)
      
      navigator.clipboard.writeText(url.toString())
      const min = Math.floor(line.startTime / 60).toString().padStart(2, '0')
      const sec = Math.floor(line.startTime % 60).toString().padStart(2, '0')
      toast.success(`Clip link (starting at ${min}:${sec}) copied! Anyone with the link can view.`)
    } catch (e) {
      toast.error("Failed to share clip.")
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-900 overflow-hidden flex-col md:flex-row font-sans">
      
      {/* Left Column (Video + Transcript) */}
      <div className="flex-1 flex flex-col border-r border-slate-200 h-full overflow-hidden relative bg-white rounded-l-none md:rounded-r-2xl shadow-2xl z-10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-5">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200 shadow-sm">
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
            {!isSimulationActive && initialData.isOwner && (
              <Button 
                variant={meeting.isPublic ? "default" : "outline"} 
                className={meeting.isPublic ? "bg-sky-600 hover:bg-sky-700 text-white font-medium" : "border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-sm"}
                onClick={handleShare}
              >
                {meeting.isPublic ? "Shared (Copy Link)" : "Share"}
              </Button>
            )}
            {isSimulationActive && (
              <Badge variant="outline" className="animate-pulse bg-red-50 text-red-600 border-red-200 px-3 py-1 font-bold tracking-wide shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                LIVE RECORDING
              </Badge>
            )}
          </div>
        </div>
        
        {/* Live Companion Banner */}
        {isSimulationActive && (
          <div className="w-full bg-slate-900 text-white px-6 py-3 flex items-center justify-between z-20 shrink-0 shadow-lg border-b border-slate-800">
             <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Tags:</span>
               <Button onClick={() => handleLiveTag('Highlight')} variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-amber-400">
                 <Star className="w-4 h-4 mr-2" /> Highlight Moment
               </Button>
               <Button onClick={() => handleLiveTag('Action Item')} variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-sky-400">
                 <Bookmark className="w-4 h-4 mr-2" /> Action Item
               </Button>
               <Button onClick={() => handleLiveTag('Key Decision')} variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-emerald-400">
                 <Lightbulb className="w-4 h-4 mr-2" /> Decision
               </Button>
             </div>
             <Button onClick={endSimulation} variant="destructive" size="sm" className="font-bold shadow-md hover:bg-red-600">
               End Meeting
             </Button>
          </div>
        )}

        <VideoPlayer mediaUrl={meeting.mediaUrl} isLive={isSimulationActive} transcripts={visibleTranscripts} />
        
        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
          {(!initialData.isOwner && clipParam) && (
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm font-medium z-20 shadow-sm">
              <Star className="w-4 h-4" />
              Viewing shared clip • {Math.floor(parseFloat(tParam || '0') / 60).toString().padStart(2, '0')}:{(Math.floor(parseFloat(tParam || '0') % 60)).toString().padStart(2, '0')}
            </div>
          )}
          <TranscriptViewer 
            transcripts={visibleTranscripts} 
            isLive={isSimulationActive} 
            isOwner={initialData.isOwner}
            onShareClip={handleShareClip}
            onHighlightToggle={(lineId, isHighlighted) => {
            setFullTranscript(prev => prev.map(l => l.id === lineId ? { ...l, isHighlighted } : l))
          }}
        />
        </div>
      </div>

      {/* Right Column */}
      <div className="h-full z-0 relative w-full lg:w-[40%] xl:w-[35%] 2xl:w-[30%] min-w-[400px] shrink-0">
        <InsightsPanel 
          meetingId={meeting.id}
          isLive={isSimulationActive}
          transcripts={visibleTranscripts}
          actionItems={meetingActionItems}
          currentSummary={currentSummary}
          activeTemplate={activeTemplate}
          isGenerating={isGenerating}
          onTemplateChange={handleTemplateChange}
          onShareClip={handleShareClip}
          onActionItemToggle={(itemId, checked) => {
            setMeetingActionItems(prev => prev.map(a => a.id === itemId ? { ...a, isCompleted: checked } : a))
          }}
        />
      </div>
    </div>
  )
}
