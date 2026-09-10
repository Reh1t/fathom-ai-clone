"use client"
import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { usePlayerStore } from "@/store/player-store"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, Scissors, Search, Loader2, Bot, ArrowLeft, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const id = resolvedParams.id
  const searchParams = useSearchParams()
  const isLive = searchParams.get("live") === "true"

  const [meeting, setMeeting] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [fullTranscript, setFullTranscript] = useState<any[]>([])
  const [meetingActionItems, setMeetingActionItems] = useState<any[]>([])
  const [currentSummary, setCurrentSummary] = useState<any>(null)

  const [activeTemplate, setActiveTemplate] = useState<string>("Standard")
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { currentTime, setCurrentTime, isPlaying, setIsPlaying, seekRequest, clearSeekRequest } = usePlayerStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Fetch Data (could poll here if `isLive` is true to show transcript arriving from webhook)
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/meetings/${id}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data.meeting)
        setIsOwner(data.isOwner)
        setFullTranscript(data.transcripts)
        setMeetingActionItems(data.actionItems)
        const summary = data.summaries.find((s: any) => s.template === activeTemplate)
        setCurrentSummary(summary)
      }
    }
    fetchData()
    
    let interval: any;
    if (isLive) {
      interval = setInterval(fetchData, 5000) // Poll every 5s for webhook updates
    }
    return () => clearInterval(interval)
  }, [id, activeTemplate, isLive])

  const handleTemplateChange = async (val: string) => {
    setActiveTemplate(val)
    setIsGenerating(true)
    
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: id, templateType: val })
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentSummary(data.summary)
        if (data.actionItems) {
          setMeetingActionItems(data.actionItems)
        }
      }
    } catch (err) {
      console.error("Summary error:", err)
    } finally {
      setIsGenerating(false)
    }
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
    if (activeLineRef.current && !isLive) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime, isLive])

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([])
  const [isChatting, setIsChatting] = useState(false)

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput
    const currentHistory = [...chatMessages]
    
    setChatInput("")
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setIsChatting(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: id, question: msg, history: currentHistory })
      })
      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error answering that.' }])
    } finally {
      setIsChatting(false)
    }
  }

  if (!meeting) return <div className="p-8 text-center text-zinc-400">Loading meeting...</div>

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden flex-col md:flex-row font-sans">
      <div className="flex-1 flex flex-col border-r border-zinc-800 h-full overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-lg">{meeting.title}</h1>
              <p className="text-sm text-zinc-400">{new Date(meeting.date).toLocaleDateString()} • {meeting.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isLive && isOwner && (
              <Button 
                variant={meeting.isPublic ? "default" : "outline"} 
                className={meeting.isPublic ? "bg-indigo-600 hover:bg-indigo-700" : "border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"}
                onClick={async () => {
                  const res = await fetch(`/api/meetings/${meeting.id}/share`, { method: 'POST' })
                  if (res.ok) {
                    const data = await res.json()
                    setMeeting({...meeting, isPublic: data.isPublic})
                    navigator.clipboard.writeText(window.location.href)
                    alert(data.isPublic ? "Public link copied to clipboard!" : "Meeting is now private.")
                  }
                }}
              >
                {meeting.isPublic ? "Shared (Copy Link)" : "Share"}
              </Button>
            )}
            {isLive && (
              <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500 border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                Recall.ai Bot Active
              </Badge>
            )}
          </div>
        </div>

        {/* Media Player Area */}
        <div className="relative h-[45vh] bg-zinc-900 border-b border-zinc-800 flex items-center justify-center shrink-0">
          {isLive ? (
            <div className="flex flex-col items-center text-zinc-500">
              <Bot className="w-12 h-12 mb-4 text-indigo-500 animate-pulse" />
              <p>The Recall.ai bot is currently in your meeting listening.</p>
              <p className="text-sm mt-2">The transcript will populate automatically via webhooks.</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={meeting.mediaUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} 
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Transcript Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-medium text-zinc-400">Transcript</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs"><Search className="w-3 h-3 mr-2"/>Search</Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6 pb-20">
              {fullTranscript.length === 0 && (
                <p className="text-sm text-zinc-500 text-center italic mt-10">No transcript available.</p>
              )}
              {fullTranscript.map((line, i) => {
                const isActive = !isLive && currentTime >= line.startTime && currentTime < line.endTime
                const isLast = i === fullTranscript.length - 1
                return (
                  <div 
                    key={line.id} 
                    ref={isActive || (isLive && isLast) ? activeLineRef : null}
                    onClick={() => !isLive && usePlayerStore.getState().seekTo(line.startTime)}
                    className={`flex gap-4 group cursor-pointer p-2 -mx-2 rounded-md transition-colors ${isActive ? 'bg-zinc-800/60' : 'hover:bg-zinc-900/50'}`}
                  >
                    <div className="w-[85px] text-xs text-zinc-500 pt-1 shrink-0 font-medium">
                      {Math.floor(line.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.startTime % 60)).toString().padStart(2, '0')} - {Math.floor(line.endTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.endTime % 60)).toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-400">{line.speaker}</span>
                        {!isLive && isOwner && (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              const res = await fetch('/api/transcribe/highlight', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ lineId: line.id })
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setFullTranscript(prev => prev.map(l => l.id === line.id ? {...l, isHighlighted: data.isHighlighted} : l));
                              }
                            }}
                            className={`transition-opacity ml-2 ${line.isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${line.isHighlighted ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-500 hover:text-yellow-400'}`} />
                          </button>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-zinc-100' : 'text-zinc-400'} ${line.isHighlighted ? 'bg-yellow-500/10 border-l-2 border-yellow-500/50 pl-2 -ml-[10px] py-0.5 rounded-r' : ''}`}>
                        {line.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Col - Summaries & Actions */}
      <div className="w-full md:w-[450px] bg-zinc-900/30 flex flex-col h-full border-l border-zinc-800 shrink-0">
        <Tabs value={activeTemplate} onValueChange={handleTemplateChange} className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="Standard" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Summary</TabsTrigger>
              <TabsTrigger value="Executive" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Action Items</TabsTrigger>
              <TabsTrigger value="Highlights" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 flex items-center gap-1.5"><Star className="w-3 h-3 hidden sm:inline" /> Highlights</TabsTrigger>
              <TabsTrigger value="Chat" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Chat AI</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {activeTemplate === 'Highlights' ? (
              <div className="space-y-4">
                {fullTranscript.filter(l => l.isHighlighted).length === 0 ? (
                   <div className="text-center mt-10">
                     <Star className="w-10 h-10 mx-auto mb-3 opacity-20 text-yellow-500" />
                     <p className="text-zinc-500 text-sm">No highlights yet.</p>
                     <p className="text-zinc-500 text-xs mt-1">Hover over transcript lines and click the star to save key moments here.</p>
                   </div>
                ) : (
                   fullTranscript.filter(l => l.isHighlighted).map((line, idx) => (
                      <div key={idx} className="p-4 bg-zinc-900/80 rounded-lg border-l-2 border-yellow-500 cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => !isLive && usePlayerStore.getState().seekTo(line.startTime)}>
                        <p className="text-xs text-indigo-400 mb-2 font-semibold">
                          {line.speaker} • {Math.floor(line.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.startTime % 60)).toString().padStart(2, '0')}
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{line.text}</p>
                      </div>
                   ))
                )}
              </div>
            ) : activeTemplate === 'Chat' ? (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center mt-10 text-zinc-500">
                      <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>Ask Gemini any question about this meeting!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-lg max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {isChatting && (
                    <div className="flex items-start">
                      <div className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 text-sm flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask about the meeting..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                  <Button onClick={handleChat} disabled={!chatInput.trim() || isChatting}>Send</Button>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="space-y-4">
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                <p className="text-xs text-indigo-400 mt-4 text-center">Gemini is generating...</p>
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
                    <div className="text-center mt-10">
                      <p className="text-zinc-500 italic mb-4">Summary will generate once Recall.ai bot leaves and webhook fires.</p>
                    </div>
                  ) : currentSummary ? (
                    <div className="space-y-4 whitespace-pre-wrap text-zinc-300 leading-relaxed">
                      {currentSummary.contentMarkdown.split('\n').map((line: string, i: number) => {
                        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-zinc-100 mt-6 mb-2">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-md font-medium text-zinc-200 mt-4 mb-2">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- **')) return <li key={i} className="ml-4 list-disc"><span className="font-semibold text-indigo-300">{line.match(/\*\*(.*?)\*\*/)?.[1]}</span> {line.replace(/- \*\*(.*?)\*\*:/, '')}</li>
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>
                        if (line.match(/^\d+\./)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
                        if (line.trim() === '') return <br key={i} />
                        return <p key={i}>{line}</p>
                      })}
                    </div>
                  ) : (
                    <div className="text-center mt-10">
                      <p className="text-zinc-500 mb-4">No summary generated yet.</p>
                      {fullTranscript.length > 0 && (
                        <Button onClick={() => handleTemplateChange(activeTemplate)}>Generate with Gemini</Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {!isGenerating && activeTemplate !== 'Chat' && meetingActionItems.length > 0 && (
              <div className="mt-12 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Detected Actions</h3>
                <div className="space-y-3">
                  {meetingActionItems.map((item: any) => (
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
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
