import { usePlayerStore } from '@/store/player-store'

describe('Player Store', () => {
  const initialState = usePlayerStore.getState()

  beforeEach(() => {
    // Reset state before each test
    usePlayerStore.setState(initialState, true)
  })

  it('should initialize with default values', () => {
    const state = usePlayerStore.getState()
    expect(state.currentTime).toBe(0)
    expect(state.isPlaying).toBe(false)
    expect(state.playbackRate).toBe(1)
    expect(state.seekRequest).toBeNull()
  })

  it('should update current time', () => {
    usePlayerStore.getState().setCurrentTime(42)
    expect(usePlayerStore.getState().currentTime).toBe(42)
  })

  it('should toggle play state', () => {
    usePlayerStore.getState().setIsPlaying(true)
    expect(usePlayerStore.getState().isPlaying).toBe(true)

    usePlayerStore.getState().setIsPlaying(false)
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('should process seek request correctly', () => {
    usePlayerStore.getState().seekTo(120)
    expect(usePlayerStore.getState().seekRequest).toBe(120)

    usePlayerStore.getState().clearSeekRequest()
    expect(usePlayerStore.getState().seekRequest).toBeNull()
  })

  it('should update playback rate', () => {
    usePlayerStore.getState().setPlaybackRate(1.5)
    expect(usePlayerStore.getState().playbackRate).toBe(1.5)
  })
})
