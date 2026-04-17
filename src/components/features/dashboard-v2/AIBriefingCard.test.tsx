import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// We need to reset the module-level session cache between tests
let AIBriefingCard: typeof import('./AIBriefingCard').AIBriefingCard

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// The card renders a floating trigger button; the greeting, insights, and
// refresh controls live inside a popover that only mounts after the trigger
// is clicked. Tests must open the popover before asserting its contents.
function openPanel() {
  fireEvent.click(screen.getByTitle('AI Briefing'))
}

describe('AIBriefingCard', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Re-import to reset module-level sessionCache
    vi.resetModules()
    const mod = await import('./AIBriefingCard')
    AIBriefingCard = mod.AIBriefingCard
  })

  it('renders greeting with user name', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ insights: ['Test insight'], source: 'claude' }),
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    // Should show a time-appropriate greeting
    const greeting = screen.getByText(/Kyle/)
    expect(greeting).toBeDefined()
  })

  it('shows loading skeleton initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    // Should have animated pulse elements (loading skeleton)
    const pulseElements = document.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('displays insights after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        insights: ['Your portfolio grew 12% this month.', 'Consider raising portrait prices.'],
        source: 'claude',
      }),
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    await waitFor(() => {
      expect(screen.getByText(/portfolio grew 12%/)).toBeDefined()
      expect(screen.getByText(/raising portrait prices/)).toBeDefined()
    })
  })

  it('shows "powered by Claude" when source is claude', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        insights: ['Test insight'],
        source: 'claude',
      }),
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    await waitFor(() => {
      expect(screen.getByText(/powered by Claude/)).toBeDefined()
    })
  })

  it('shows error state and fallback insights on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    await waitFor(() => {
      expect(screen.getByText(/AI insights unavailable/)).toBeDefined()
    })

    // Fallback insights should still be displayed
    await waitFor(() => {
      const insights = document.querySelectorAll('p.text-white\\/65')
      expect(insights.length).toBeGreaterThan(0)
    })
  })

  it('shows error state on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    await waitFor(() => {
      expect(screen.getByText(/AI insights unavailable/)).toBeDefined()
    })
  })

  it('has a refresh button', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ insights: ['Test insight'], source: 'claude' }),
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    const refreshButton = screen.getByTitle('Refresh insights')
    expect(refreshButton).toBeDefined()
  })

  it('calls fetch again when refresh is clicked', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ insights: ['Test insight'], source: 'claude' }),
    })

    render(<AIBriefingCard userName="Kyle" demoMode />)
    openPanel()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    const refreshButton = screen.getByTitle('Refresh insights')
    await user.click(refreshButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
