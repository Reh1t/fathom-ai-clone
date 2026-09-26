"use client"
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react"
import { usePlayerStore } from "@/store/player-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, ArrowDown, Bookmark, Lightbulb, Share } from "lucide-react"
import { toast } from "sonner"

interface TranscriptLine {
  id: string
  speaker: string
  startTime: number
  endTime: number
  text: string
  isHighlighted: boolean
}

interface TranscriptViewerProps {
  transcripts: TranscriptLine[]
  isLive: boolean
  isOwner: boolean
  onHighlightToggle: (lineId: string, isHighlighted: boolean) => void
  onShareClip?: (line: TranscriptLine) => void
}

const SPEAKER_PALETTE = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
]

const TranscriptRow = React.memo(({ 
  line, 
  isActive, 
  isLive, 
  isOwner, 
  isLast,
  speakerColor,
  onSeek, 
  onHighlight,
  onShareClip,
  activeRef 
}: any) => {
  return (
    <div 
      ref={isActive || (isLive && isLast) ? activeRef : null}
      onClick={() => onSeek(line.startTime)}
      className={`group cursor-pointer p-4 rounded-xl transition-all border-l-4 ${isActive ? 'bg-sky-50/80 border-sky-500 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${speakerColor.bg} ${speakerColor.text}`}>
          {line.speaker}
        </span>
        <span className="text-xs font-medium text-slate-400">
          {Math.floor(line.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.startTime % 60)).toString().padStart(2, '0')}
        </span>
        {isOwner && (
          <div className={`flex items-center gap-1.5 transition-opacity ml-2 ${line.isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button onClick={(e) => { e.stopPropagation(); onHighlight(line); }} title="Highlight">
              <Star className={`w-3.5 h-3.5 ${line.isHighlighted ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onHighlight(line); }} title="Action Item">
              <Bookmark className={`w-3.5 h-3.5 text-slate-300 hover:text-sky-400`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onHighlight(line); }} title="Decision">
              <Lightbulb className={`w-3.5 h-3.5 text-slate-300 hover:text-emerald-400`} />
            </button>
            {onShareClip && (
              <button onClick={(e) => { e.stopPropagation(); onShareClip(line); }} title="Share Clip">
                <Share className={`w-3.5 h-3.5 text-slate-300 hover:text-sky-500`} />
              </button>
            )}
          </div>
        )}
      </div>
      <p className={`text-[15px] leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700'} ${line.isHighlighted ? 'bg-amber-50 px-2 py-1 -ml-2 rounded text-slate-900 font-medium' : ''}`}>
        {line.text}
      </p>
    </div>
  )
})
TranscriptRow.displayName = "TranscriptRow";

export function TranscriptViewer({ transcripts, isLive, isOwner, onHighlightToggle, onShareClip }: TranscriptViewerProps) {
  const { currentTime, seekTo } = usePlayerStore()
  const activeLineRef = useRef<HTMLDivElement>(null)
  
  const [localSearch, setLocalSearch] = useState("")
  const [activeSpeakerFilter, setActiveSpeakerFilter] = useState<string | null>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  // 1. Compute Active Segment once per frame (Parent level)
  const activeSegmentId = useMemo(() => {
    if (isLive) return transcripts[transcripts.length - 1]?.id;
    const active = transcripts.find(l => currentTime >= l.startTime && currentTime < l.endTime);
    return active?.id;
  }, [currentTime, transcripts, isLive]);

  // 2. Smart Auto-Scroll Effect
  useEffect(() => {
    if (!isUserScrolling && activeSegmentId && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSegmentId, isUserScrolling]);

  // 3. Handlers
  const handleHighlight = useCallback(async (line: TranscriptLine) => {
    try {
      const res = await fetch('/api/transcribe/highlight', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ lineId: line.id })
      })
      if (res.ok) {
        const data = await res.json()
        onHighlightToggle(line.id, data.isHighlighted)
        if (data.isHighlighted) {
          toast.success("Highlight created!")
        }
      } else {
        toast.error("Failed to highlight.")
      }
    } catch (e) {
      toast.error("Failed to highlight due to network error.")
    }
  }, [onHighlightToggle]);

  const handleSeek = useCallback((time: number) => {
    if (!isLive) seekTo(time);
    setIsUserScrolling(false);
  }, [isLive, seekTo]);

  // 4. Data Derivations
  const uniqueSpeakers = useMemo(() => Array.from(new Set(transcripts.map(t => t.speaker))), [transcripts]);
  
  const speakerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    transcripts.forEach(t => {
      stats[t.speaker] = (stats[t.speaker] || 0) + 1;
    });
    return stats;
  }, [transcripts]);

  const visibleTranscripts = useMemo(() => {
    return transcripts.filter(t => {
      const matchesSearch = localSearch ? t.text.toLowerCase().includes(localSearch.toLowerCase()) : true;
      const matchesSpeaker = activeSpeakerFilter ? t.speaker === activeSpeakerFilter : true;
      return matchesSearch && matchesSpeaker;
    });
  }, [transcripts, localSearch, activeSpeakerFilter]);

  const getSpeakerColor = useCallback((speakerName: string) => {
    const index = uniqueSpeakers.indexOf(speakerName);
    return SPEAKER_PALETTE[index % SPEAKER_PALETTE.length];
  }, [uniqueSpeakers]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden relative">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Transcript</h3>
          <div className="relative w-48">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
            <Input 
              placeholder="Search transcript..." 
              className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Speaker Filter Bar */}
        {uniqueSpeakers.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSpeakerFilter(null)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-colors ${!activeSpeakerFilter ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            >
              All
            </button>
            {uniqueSpeakers.map(speaker => {
              const color = getSpeakerColor(speaker);
              const isActive = activeSpeakerFilter === speaker;
              return (
                <button
                  key={speaker}
                  onClick={() => setActiveSpeakerFilter(isActive ? null : speaker)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all border ${isActive ? `border-slate-800 ring-2 ring-slate-800 ring-offset-1 ${color.bg} ${color.text}` : `${color.border} ${color.bg} ${color.text} hover:opacity-80`}`}
                >
                  {speaker}
                  <span className="opacity-60 font-medium text-[10px] bg-white/50 px-1.5 rounded-full">{speakerStats[speaker]}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div 
        className="flex-1 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 relative"
        onWheel={() => setIsUserScrolling(true)}
        onTouchMove={() => setIsUserScrolling(true)}
      >
        <div className="py-6 space-y-2 pb-32">
          {visibleTranscripts.length === 0 && (
            <p className="text-sm text-slate-500 text-center italic mt-10">No transcript matches found.</p>
          )}
          {visibleTranscripts.map((line, i) => (
            <TranscriptRow
              key={line.id}
              line={line}
              isActive={line.id === activeSegmentId}
              isLive={isLive}
              isOwner={isOwner}
              isLast={i === visibleTranscripts.length - 1}
              speakerColor={getSpeakerColor(line.speaker)}
              onSeek={handleSeek}
              onHighlight={handleHighlight}
              onShareClip={onShareClip}
              activeRef={activeLineRef}
            />
          ))}
        </div>
      </div>
      
      {/* Resume Auto-Scroll Button */}
      {isUserScrolling && !isLive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-4">
          <Button 
            onClick={() => setIsUserScrolling(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl rounded-full px-5 py-2 font-medium text-sm flex items-center gap-2 border border-slate-700/50"
          >
            <ArrowDown className="w-4 h-4" />
            Resume Auto-Scroll
          </Button>
        </div>
      )}
    </div>
  )
}
