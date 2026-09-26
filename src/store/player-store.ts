import { create } from 'zustand';

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  seekTo: (time: number) => void;
  seekRequest: number | null;
  clearSeekRequest: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1,
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  seekTo: (time) => set({ seekRequest: time }),
  seekRequest: null,
  clearSeekRequest: () => set({ seekRequest: null }),
}));

