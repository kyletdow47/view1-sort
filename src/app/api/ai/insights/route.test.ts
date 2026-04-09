import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockInvoke = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  }),
}))

import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/ai/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validStats = {
  totalPhotos: 500,
  categoryCounts: { portraits: 200, ceremony: 150, details: 150 },
  qualityDistribution: { high: 350, medium: 100, low: 50 },
  duplicateCount: 10,
}

describe('POST /api/ai/insights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Claude-generated insights when edge function succeeds', async () => {
    const mockData = {
      insights: ['Insight 1', 'Insight 2', 'Insight 3'],
      source: 'claude',
    }
    mockInvoke.mockResolvedValue({ data: mockData, error: null })

    const res = await POST(makeRequest({ stats: validStats }))
    const data = await res.json()

    expect(data.source).toBe('claude')
    expect(data.insights).toHaveLength(3)
  })

  it('returns cached insights when edge function returns cached result', async () => {
    const mockData = {
      insights: ['Cached insight'],
      source: 'cache',
    }
    mockInvoke.mockResolvedValue({ data: mockData, error: null })

    const res = await POST(makeRequest({ stats: validStats }))
    const data = await res.json()

    expect(data.source).toBe('cache')
  })

  it('falls back to mock insights when edge function fails', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ stats: validStats }))
    const data = await res.json()

    expect(data.source).toBe('fallback')
    expect(data.insights.length).toBeGreaterThan(0)
  })

  it('returns fallback when no stats provided', async () => {
    const res = await POST(makeRequest({}))
    const data = await res.json()

    expect(data.source).toBe('fallback')
    expect(data.insights.length).toBeGreaterThan(0)
  })

  it('returns fallback when edge function throws', async () => {
    mockInvoke.mockRejectedValue(new Error('Network error'))

    const res = await POST(makeRequest({ stats: validStats }))
    const data = await res.json()

    expect(data.source).toBe('fallback')
  })
})
