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
  return new NextRequest('http://localhost/api/ai/captions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/captions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Claude-generated captions when edge function succeeds', async () => {
    const mockData = {
      captions: ['Professional caption', 'Warm caption', 'Story caption'],
      tone_variants: {
        professional: 'Professional caption',
        warm: 'Warm caption',
        storytelling: 'Story caption',
      },
      source: 'claude',
    }
    mockInvoke.mockResolvedValue({ data: mockData, error: null })

    const res = await POST(makeRequest({ platform: 'instagram', tone: 'warm' }))
    const data = await res.json()

    expect(data.source).toBe('claude')
    expect(data.captions).toHaveLength(3)
    expect(data.tone_variants.professional).toBe('Professional caption')
  })

  it('falls back to mock captions when edge function fails', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function not found' } })

    const res = await POST(makeRequest({ platform: 'instagram' }))
    const data = await res.json()

    expect(data.source).toBe('mock')
    expect(data.captions.length).toBeGreaterThan(0)
    expect(data.tone_variants).toBeDefined()
  })

  it('falls back to mock captions when edge function throws', async () => {
    mockInvoke.mockRejectedValue(new Error('Network error'))

    const res = await POST(makeRequest({ platform: 'tiktok' }))
    const data = await res.json()

    expect(data.source).toBe('mock')
    expect(data.captions.length).toBeGreaterThan(0)
  })

  it('returns platform-specific mock captions as fallback', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ platform: 'tiktok' }))
    const data = await res.json()

    expect(data.source).toBe('mock')
    // TikTok mock captions should exist
    expect(data.captions.length).toBeGreaterThan(0)
  })

  it('returns default captions for unknown platform', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ platform: 'unknown_platform' }))
    const data = await res.json()

    expect(data.source).toBe('mock')
    expect(data.captions.length).toBeGreaterThan(0)
  })
})
