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
  return new NextRequest('http://localhost/api/ai/parse-vibe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/parse-vibe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when description is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('description is required')
  })

  it('returns 400 when description is empty string', async () => {
    const res = await POST(makeRequest({ description: '  ' }))
    expect(res.status).toBe(400)
  })

  it('returns Claude-parsed result when edge function succeeds', async () => {
    const mockData = {
      presetName: 'Moody Editorial',
      confidence: 0.92,
      styleParams: {
        mood: 'dramatic',
        lighting: 'low-key',
        composition: 'tight',
        colorTemp: 'cool',
        subjects: ['faces', 'emotion'],
        avoidPatterns: ['overexposed'],
      },
      source: 'claude',
    }
    mockInvoke.mockResolvedValue({ data: mockData, error: null })

    const res = await POST(makeRequest({ description: 'moody dark editorial' }))
    const data = await res.json()

    expect(data.presetName).toBe('Moody Editorial')
    expect(data.styleParams.mood).toBe('dramatic')
  })

  it('falls back to heuristic when edge function fails', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'moody dark dramatic' }))
    const data = await res.json()

    expect(data.presetName).toBe('Moody & Dramatic')
    expect(data.styleParams.mood).toBe('dramatic')
    expect(data.source).toBe('heuristic')
  })

  it('heuristic handles bright/airy descriptions', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'bright airy soft light' }))
    const data = await res.json()

    expect(data.presetName).toBe('Bright & Airy')
    expect(data.styleParams.mood).toBe('joyful')
    expect(data.styleParams.lighting).toBe('high-key')
  })

  it('heuristic handles editorial descriptions', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'editorial magazine tight crop' }))
    const data = await res.json()

    expect(data.presetName).toBe('Editorial Tight')
    expect(data.styleParams.composition).toBe('tight')
  })

  it('heuristic handles warm descriptions', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'warm golden sunset amber' }))
    const data = await res.json()

    expect(data.styleParams.colorTemp).toBe('warm')
  })

  it('heuristic handles unknown descriptions gracefully', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'something completely unrelated' }))
    const data = await res.json()

    expect(data.presetName).toBe('Custom Style')
    expect(data.styleParams.mood).toBe('natural')
  })

  it('heuristic returns confidence score', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(makeRequest({ description: 'moody dark dramatic shadows' }))
    const data = await res.json()

    expect(data.confidence).toBeGreaterThan(0)
    expect(data.confidence).toBeLessThanOrEqual(1)
  })
})
