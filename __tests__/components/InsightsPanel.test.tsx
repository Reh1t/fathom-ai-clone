import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InsightsPanel } from '@/features/meeting/components/InsightsPanel'

// Mock dependencies
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))
jest.mock('react-markdown', () => (props: any) => <div>{props.children}</div>)
jest.mock('framer-motion', () => ({
  motion: { div: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))
jest.mock('remark-gfm', () => () => {})

describe('InsightsPanel Component', () => {
  const mockActionItems = [
    { id: '1', task: 'Test Action Item', isCompleted: false, assignee: 'George' }
  ]

  const mockTranscripts = [
    { id: '1', speaker: 'George (Product)', text: 'Hello', startTime: 0, endTime: 5, isHighlighted: false },
    { id: '2', speaker: 'George (Product)', text: 'World', startTime: 5, endTime: 10, isHighlighted: false },
    { id: '3', speaker: 'Ian (Design)', text: 'Hi', startTime: 10, endTime: 15, isHighlighted: false },
  ]

  const defaultProps = {
    meetingId: 'test-123',
    isLive: false,
    transcripts: mockTranscripts,
    actionItems: mockActionItems,
    currentSummary: { contentMarkdown: 'Test summary' },
    activeTemplate: 'Standard',
    isGenerating: false,
    onTemplateChange: jest.fn(),
    onActionItemToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the summary by default', () => {
    render(<InsightsPanel {...defaultProps} />)
    expect(screen.getByText('Test summary')).toBeInTheDocument()
  })

  it('renders Action Items when passed', async () => {
    render(<InsightsPanel {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
  })

  it('calls onActionItemToggle when checkbox is clicked', async () => {
    render(<InsightsPanel {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(defaultProps.onActionItemToggle).toHaveBeenCalledWith('1', true)
  })

  it('displays dynamic prompt in Chat tab based on top speaker', async () => {
    render(<InsightsPanel {...defaultProps} activeTemplate="Chat" />)
    await waitFor(() => {
      expect(screen.getByText("Summarize George's key points")).toBeInTheDocument()
    })
  })

  it('switches templates when a tab is clicked', async () => {
    render(<InsightsPanel {...defaultProps} />)
    const actionItemsTab = screen.getByRole('tab', { name: /Action Items/i })
    fireEvent.click(actionItemsTab)
    
    await waitFor(() => {
      expect(defaultProps.onTemplateChange).toHaveBeenCalledWith('Executive', expect.anything())
    })
  })
})
