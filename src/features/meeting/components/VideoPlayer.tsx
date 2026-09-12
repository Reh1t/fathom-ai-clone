"use client"
import React, { useRef, useEffect } from "react"
import { usePlayerStore } from "@/store/player-store"
import { Loader2 } from "lucide-react"

interface VideoPlayerProps {
  mediaUrl: string | null
  isLive: boolean
}

export function VideoPlayer({ mediaUrl, isLive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { setCurrentTime, setIsPlaying, seekRequest, clearSeekRequest } = usePlayerStore()

  useEffect(() => {
    if (seekRequest !== null && videoRef.current && !isLive) {
      videoRef.current.currentTime = seekRequest
      clearSeekRequest()
    }
  }, [seekRequest, isLive, clearSeekRequest])

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  return (
    <div className="w-full bg-slate-100 shrink-0 flex items-center justify-center border-b border-slate-200">
      <div className="w-full max-w-5xl aspect-video relative flex items-center justify-center bg-slate-200/50">
        {isLive ? (
          <div className="flex flex-col items-center text-slate-500">
            <Loader2 className="w-12 h-12 mb-5 text-sky-500 animate-spin" />
            <p className="text-xl font-bold text-slate-900 tracking-tight">Preparing your meeting capture...</p>
            <p className="text-sm mt-2 font-medium">Demo capture &middot; recording simulation</p>
          </div>
        ) : (
          <video 
            ref={videoRef}
            src={mediaUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  )
}
