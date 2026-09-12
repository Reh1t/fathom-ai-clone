"use client"
import React, { useRef, useEffect } from "react"
import { usePlayerStore } from "@/store/player-store"
import { Button } from "@/components/ui/button"
import { Search, Star } from "lucide-react"

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
}

export function TranscriptViewer({ transcripts, isLive, isOwner, onHighlightToggle }: TranscriptViewerProps) {
  const { currentTime } = usePlayerStore()
  const activeLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeLineRef.current && !isLive) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime, isLive])

  const handleHighlight = async (e: React.MouseEvent, line: TranscriptLine) => {
    e.stopPropagation()
    const res = await fetch('/api/transcribe/highlight', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ lineId: line.id })
    })
    if (res.ok) {
      const data = await res.json()
      onHighlightToggle(line.id, data.isHighlighted)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Transcript</h3>
        <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 shadow-sm">
          <Search className="w-3.5 h-3.5 mr-2"/>Search
        </Button>
      </div>
      <div className="flex-1 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className="py-6 space-y-2 pb-32">
          {transcripts.length === 0 && (
            <p className="text-sm text-slate-500 text-center italic mt-10">No transcript available.</p>
          )}
          {transcripts.map((line, i) => {
            const isActive = !isLive && currentTime >= line.startTime && currentTime < line.endTime
            const isLast = i === transcripts.length - 1
            return (
              <div 
                key={line.id} 
                ref={isActive || (isLive && isLast) ? activeLineRef : null}
                onClick={() => !isLive && usePlayerStore.getState().seekTo(line.startTime)}
                className={`group cursor-pointer p-4 rounded-xl transition-all border-l-4 ${isActive ? 'bg-sky-50/80 border-sky-500 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{line.speaker}</span>
                  <span className="text-xs font-medium text-slate-400">
                    {Math.floor(line.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.startTime % 60)).toString().padStart(2, '0')}
                  </span>
                  {!isLive && isOwner && (
                    <button 
                      onClick={(e) => handleHighlight(e, line)}
                      className={`transition-opacity ml-2 ${line.isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Star className={`w-4 h-4 ${line.isHighlighted ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  )}
                </div>
                <p className={`text-[15px] leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700'} ${line.isHighlighted ? 'bg-amber-50 px-2 py-1 -ml-2 rounded text-slate-900 font-medium' : ''}`}>
                  {line.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
