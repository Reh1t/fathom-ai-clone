"use client"
import React, { useRef, useEffect, useMemo } from "react"
import { usePlayerStore } from "@/store/player-store"
import { Loader2, Play, Pause, SkipBack, SkipForward, MicOff } from "lucide-react"

interface TranscriptLine {
  id: string
  speaker: string
  startTime: number
  endTime: number
  text: string
  isHighlighted: boolean
}

interface VideoPlayerProps {
  mediaUrl: string | null
  isLive: boolean
  transcripts?: TranscriptLine[]
}

const SPEAKER_PALETTE = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', ring: 'ring-rose-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-500' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', ring: 'ring-cyan-500' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', ring: 'ring-pink-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-500' },
]

export function VideoPlayer({ mediaUrl, isLive, transcripts = [] }: VideoPlayerProps) {
  const { 
    currentTime, 
    setCurrentTime, 
    isPlaying, 
    setIsPlaying, 
    playbackRate, 
    setPlaybackRate, 
    seekRequest, 
    clearSeekRequest,
    seekTo
  } = usePlayerStore()

  // Synthetic engine refs
  const lastFrameTime = useRef<number>(Date.now())
  const animationRef = useRef<number>(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Calculate duration
  const duration = useMemo(() => {
    if (transcripts.length === 0) return 3600;
    return transcripts[transcripts.length - 1].endTime + 5;
  }, [transcripts])

  // Get active segment
  const activeSegment = useMemo(() => {
    return transcripts.find(l => currentTime >= l.startTime && currentTime < l.endTime)
  }, [currentTime, transcripts])

  const uniqueSpeakers = useMemo(() => Array.from(new Set(transcripts.map(t => t.speaker))), [transcripts])

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Sync play/pause state
  useEffect(() => {
    if (!audioRef.current || isLive) return
    if (isPlaying) {
      audioRef.current.play().catch(e => { console.error("Audio play blocked", e); setIsPlaying(false); })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, isLive, setIsPlaying])

  // Playback Loop (Synthetic vs Real Audio)
  useEffect(() => {
    if (isLive) return;

    const loop = () => {
      const now = Date.now();
      const delta = (now - lastFrameTime.current) / 1000;
      lastFrameTime.current = now;

      const state = usePlayerStore.getState();

      if (mediaUrl && audioRef.current) {
        // Real audio mode: sync state to audio element
        if (state.isPlaying) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.ended) {
            setIsPlaying(false);
          }
        }
      } else {
        // Synthetic mode: math-based playback
        if (state.isPlaying) {
          const nextTime = state.currentTime + (delta * state.playbackRate);
          if (nextTime >= duration) {
            setCurrentTime(duration);
            setIsPlaying(false);
          } else {
            setCurrentTime(nextTime);
          }
        }
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    lastFrameTime.current = Date.now();
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isLive, duration, setCurrentTime, setIsPlaying, mediaUrl]);

  // Handle Seek Request
  useEffect(() => {
    if (seekRequest !== null && !isLive) {
      const targetTime = Math.min(seekRequest, duration)
      if (mediaUrl && audioRef.current) {
        audioRef.current.currentTime = targetTime
      }
      setCurrentTime(targetTime)
      clearSeekRequest()
    }
  }, [seekRequest, isLive, duration, setCurrentTime, clearSeekRequest, mediaUrl])

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(Math.max(0, Math.min(percent * duration, duration)))
  }

  const gridCols = uniqueSpeakers.length > 4 ? 'grid-cols-4' : (uniqueSpeakers.length > 2 ? 'grid-cols-3' : 'grid-cols-2')

  return (
    <div className="w-full bg-slate-900 shrink-0 flex flex-col items-center justify-center border-b border-slate-800 relative z-10 overflow-hidden">
      {/* STAGE */}
      <div className="w-full max-w-6xl aspect-[21/9] relative flex flex-col p-4">
        {/* Grid */}
        <div className={`flex-1 grid ${gridCols} gap-3 p-4`}>
              {uniqueSpeakers.map((speaker, idx) => {
                const isActive = activeSegment?.speaker === speaker;
                const color = SPEAKER_PALETTE[idx % SPEAKER_PALETTE.length];
                return (
                  <div 
                    key={speaker} 
                    className={`relative bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300
                      ${isActive ? `ring-2 ring-offset-2 ring-offset-slate-900 ${color.ring} scale-[1.02] shadow-lg` : 'ring-1 ring-slate-700/50'}
                    `}
                  >
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${color.bg} ${color.text}`}>
                      {speaker.substring(0, 1).toUpperCase()}
                    </div>
                    {/* Label */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-xs font-medium text-white flex items-center gap-2">
                      {isActive ? (
                        <div className="flex items-end gap-[2px] h-3">
                          <div className={`w-1 bg-green-400 animate-[bounce_0.8s_infinite] h-full`}></div>
                          <div className={`w-1 bg-green-400 animate-[bounce_1s_infinite] h-2/3`}></div>
                          <div className={`w-1 bg-green-400 animate-[bounce_0.7s_infinite] h-full`}></div>
                          <div className={`w-1 bg-green-400 animate-[bounce_0.9s_infinite] h-1/2`}></div>
                        </div>
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {speaker}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Closed Captions */}
            {activeSegment && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-3xl text-center pointer-events-none transition-all duration-300">
                <span className="bg-slate-900/80 backdrop-blur-md text-slate-100 px-5 py-3 rounded-xl text-[17px] font-medium leading-relaxed shadow-xl inline-block border border-slate-700/50">
                  <span className="text-sky-400 font-bold mr-2">{activeSegment.speaker}:</span>
                  {activeSegment.text}
                </span>
              </div>
            )}
      </div>

      {/* CUSTOM CONTROLS */}
      <div className="w-full px-8 py-5 bg-slate-950 flex flex-col gap-4 border-t border-slate-900">
        {/* Timeline Scrubber */}
        <div 
          className="w-full h-2.5 bg-slate-800 rounded-full cursor-pointer relative group transition-all hover:h-3"
          onClick={!isLive ? handleScrub : undefined}
        >
          {/* Progress Fill */}
          <div 
            className="h-full bg-sky-500 rounded-full pointer-events-none transition-all duration-75"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
          
          {/* Highlight Pins */}
          {transcripts.filter(t => t.isHighlighted).map(t => (
            <div 
              key={t.id}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-4 bg-amber-400 rounded-full shadow hover:scale-150 transition-transform cursor-pointer ring-2 ring-slate-950"
              style={{ left: `calc(${(t.startTime / duration) * 100}% - 5px)` }}
              onClick={!isLive ? (e) => { e.stopPropagation(); seekTo(t.startTime) } : undefined}
              title={`${t.speaker}: "${t.text.substring(0, 50)}..."`}
            ></div>
          ))}
        </div>

        {/* Buttons */}
        {!isLive && (
          <div className="flex items-center justify-between text-slate-400 pt-1">
            <div className="flex items-center gap-5">
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-sky-400 transition-colors">
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
              </button>
              <button onClick={() => seekTo(Math.max(0, currentTime - 10))} className="hover:text-white transition-colors" title="Rewind 10s">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => seekTo(Math.min(duration, currentTime + 10))} className="hover:text-white transition-colors" title="Forward 10s">
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium tabular-nums ml-2">
                <span className="text-white">{formatTime(currentTime)}</span> <span className="text-slate-600 mx-1">/</span> {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
                className="text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors ring-1 ring-slate-700"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        )}
      </div>

      {mediaUrl && (
        <audio 
          ref={audioRef} 
          src={mediaUrl} 
          preload="auto" 
          className="hidden" 
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  )
}
