import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlobalSearch } from '@/components/global-search'

// Mock fetch for the API call
global.fetch = jest.fn()

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] })
    })
  })

  it('focuses input on Cmd+K', () => {
    render(<GlobalSearch />)
    
    // Initially not focused
    expect(screen.getByPlaceholderText('Search transcripts across all meetings...')).not.toHaveFocus()

    // Press Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true })

    // Now it should be focused
    expect(screen.getByPlaceholderText('Search transcripts across all meetings...')).toHaveFocus()
  })

  it('does not steal focus if user is typing in an input', () => {
    render(
      <div>
        <input type="text" data-testid="chat-input" />
        <GlobalSearch />
      </div>
    )

    const chatInput = screen.getByTestId('chat-input')
    chatInput.focus()

    // Press Cmd+K while focused on input
    fireEvent.keyDown(document, { key: 'k', metaKey: true })

    // Modal should NOT open because of the active element check
    expect(screen.getByPlaceholderText('Search transcripts across all meetings...')).not.toHaveFocus()
  })

  it('handles regex characters safely without crashing', async () => {
    const user = userEvent.setup()
    render(<GlobalSearch />)
    
    // Open modal
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = screen.getByPlaceholderText('Search transcripts across all meetings...')
    
    // Type special regex chars
    fireEvent.change(input, { target: { value: '?*[)\\' } })

    // Debounce wait
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/search?q=%3F*%5B)%5C'))
    })
    
    // Test passes if it didn't crash
  })
})
