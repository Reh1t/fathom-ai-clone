"use client"
import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { usePlayerStore } from "@/store/player-store"
import { meetings } from "@/fixtures/meetings"
import { transcripts, TranscriptLine } from "@/fixtures/transcripts"
import { summaries, actionItems, SummaryTemplate } from "@/fixtures/summaries"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, Scissors, Search, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const searchParams = useSearchParams()
  const isLive = searchParams.get("live") === "true"

  const meeting = meetings.find(m => m.id === id)
  const fullTranscript = transcripts.filter(t => t.meetingId === id)
  const meetingActionItems = actionItems.filter(a => a.meetingId === id)

  const [activeTemplate, setActiveTemplate] = useState<SummaryTemplate>("Standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [liveLines, setLiveLines] = useState<TranscriptLine[]>([])

  const { currentTime, setCurrentTime, isPlaying, setIsPlaying, seekRequest, clearSeekRequest } = usePlayerStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Simulated live bot logic
  useEffect(() => {
    if (!isLive) return
    let index = 0
    const interval = setInterval(() => {
      if (index < fullTranscript.length) {
        setLiveLines(prev => [...prev, fullTranscript[index]])
        index++
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isLive, fullTranscript])

  // Template switching loader simulation
  const handleTemplateChange = (val: string) => {
    setIsGenerating(true)
    setActiveTemplate(val as SummaryTemplate)
    setTimeout(() => {
      setIsGenerating(false)
    }, 1500)
  }

  // Video sync logic
  useEffect(() => {
    if (seekRequest !== null && videoRef.current && !isLive) {
      videoRef.current.currentTime = seekRequest
      clearSeekRequest()
    }
  }, [seekRequest, isLive, clearSeekRequest])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Auto-scroll transcript
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime])

  if (!meeting) return <div className="p-8 text-center text-zinc-400">Meeting not found</div>

  const displayedTranscript = isLive ? liveLines : fullTranscript
  const currentSummary = summaries.find(s => s.meetingId === id && s.template === activeTemplate)

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden flex-col md:flex-row">
      {/* Left Col - Media & Transcript */}
      <div className="flex-1 flex flex-col border-r border-zinc-800 h-full">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h1 className="font-semibold text-lg">{meeting.title}</h1>
            <p className="text-sm text-zinc-400">{new Date(meeting.date).toLocaleDateString()} • {meeting.duration}</p>
          </div>
          {isLive && (
            <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500 border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Bot Active
            </Badge>
          )}
        </div>

        {/* Media Player Area */}
        <div className="relative aspect-video bg-zinc-900 border-b border-zinc-800 flex items-center justify-center">
          {isLive ? (
            <div className="flex flex-col items-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Bot is actively listening...</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={meeting.mediaUrl} 
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Transcript Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Transcript</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs"><Search className="w-3 h-3 mr-2"/>Search</Button>
          </div>
          <ScrollArea className="flex-1 p-4" ref={transcriptRef}>
            <div className="space-y-6">
              {displayedTranscript.length === 0 && isLive && (
                <p className="text-sm text-zinc-500 text-center italic mt-10">Waiting for speech...</p>
              )}
              {displayedTranscript.map((line, i) => {
                const isActive = !isLive && currentTime >= line.startTime && currentTime < line.endTime
                return (
                  <div 
                    key={line.id} 
                    ref={isActive ? activeLineRef : null}
                    onClick={() => !isLive && usePlayerStore.getState().seekTo(line.startTime)}
                    className={`flex gap-4 group cursor-pointer p-2 -mx-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60' : 'hover:bg-zinc-900/50'}`}
                  >
                    <div className="w-12 text-xs text-zinc-500 pt-1 shrink-0">
                      {Math.floor(line.startTime / 60)}:{(line.startTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-400">{line.speaker}</span>
                      </div>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`}>
                        {line.text}
                      </p>
                    </div>
                    {!isLive && (
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Scissors className="w-3 h-3"/></Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Col - Summaries & Actions */}
      <div className="w-full md:w-96 bg-zinc-900/30 flex flex-col h-full border-l border-zinc-800">
        <Tabs value={activeTemplate} onValueChange={handleTemplateChange} className="flex-1 flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="Standard" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Standard</TabsTrigger>
              <TabsTrigger value="Executive" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Executive</TabsTrigger>
              <TabsTrigger value="ActionItems" className="flex-1 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Actions</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTemplate}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="prose prose-invert prose-sm max-w-none"
                >
                  {isLive ? (
                    <p className="text-zinc-500 italic text-center mt-10">Summary will generate once meeting concludes.</p>
                  ) : currentSummary ? (
                    <div className="space-y-4 whitespace-pre-wrap text-zinc-300 leading-relaxed">
                      {/* Very basic markdown rendering for the stubbed content */}
                      {currentSummary.contentMarkdown.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-zinc-100 mt-6 mb-2">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-md font-medium text-zinc-200 mt-4 mb-2">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- **')) return <li key={i} className="ml-4 list-disc"><span className="font-semibold text-indigo-300">{line.match(/\*\*(.*?)\*\*/)?.[1]}</span> {line.replace(/- \*\*(.*?)\*\*:/, '')}</li>
                        if (line.startsWith('- [ ]')) return <li key={i} className="ml-4 list-none flex items-start gap-2 mt-2"><Checkbox className="mt-1" /> <span>{line.replace('- [ ]', '')}</span></li>
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>
                        if (line.match(/^\d+\./)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
                        if (line.includes('**')) {
                            const parts = line.split('**');
                            return <p key={i}>{parts.map((p, j) => j % 2 === 1 ? <span key={j} className="font-semibold text-zinc-100">{p}</span> : p)}</p>
                        }
                        if (line.trim() === '') return <br key={i} />
                        return <p key={i}>{line}</p>
                      })}
                    </div>
                  ) : (
                    <p>No summary available for this template.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {!isLive && activeTemplate !== "ActionItems" && meetingActionItems.length > 0 && (
              <div className="mt-12 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Detected Actions</h3>
                <div className="space-y-3">
                  {meetingActionItems.map(item => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <Checkbox id={item.id} defaultChecked={item.isCompleted} className="mt-1" />
                      <div className="grid gap-1.5 leading-none flex-1">
                        <label htmlFor={item.id} className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {item.task}
                        </label>
                        <p className="text-xs text-indigo-400 font-medium">{item.assignee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
