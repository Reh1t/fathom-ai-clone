import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TranscriptViewer } from '@/features/meeting/components/TranscriptViewer'
import { usePlayerStore } from '@/store/player-store'

// Mock dependencies
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Star: () => <div data-testid="star-icon" />,
  ArrowDown: () => <div data-testid="arrow-down-icon" />,
  Bookmark: () => <div data-testid="bookmark-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
  Share: () => <div data-testid="share-icon" />
}))

describe('TranscriptViewer Component', () => {
  const mockTranscripts = [
    { id: '1', speaker: 'George', text: 'First line', startTime: 0, endTime: 10, isHighlighted: false },
    { id: '2', speaker: 'Ian', text: 'Second line', startTime: 10, endTime: 20, isHighlighted: false },
  ]

  const defaultProps = {
    transcripts: mockTranscripts,
    isLive: false,
    isOwner: true,
    onHighlightToggle: jest.fn(),
    onShareClip: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    usePlayerStore.setState({ currentTime: 0, seekTo: jest.fn() })
  })

  it('renders all transcript lines', () => {
    render(<TranscriptViewer {...defaultProps} />)
    expect(screen.getByText('First line')).toBeInTheDocument()
    expect(screen.getByText('Second line')).toBeInTheDocument()
  })

  it('seeks when a transcript line is clicked', () => {
    const mockSeekTo = jest.fn()
    usePlayerStore.setState({ seekTo: mockSeekTo })
    
    render(<TranscriptViewer {...defaultProps} />)
    
    // Click the second line
    fireEvent.click(screen.getByText('Second line'))
    
    expect(mockSeekTo).toHaveBeenCalledWith(10) // startTime of second line
  })

  it('filters transcripts based on search query', () => {
    render(<TranscriptViewer {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search transcript...')
    fireEvent.change(searchInput, { target: { value: 'Second' } })
    
    // First line should be filtered out
    expect(screen.queryByText('First line')).not.toBeInTheDocument()
    expect(screen.getByText('Second line')).toBeInTheDocument()
  })
})
