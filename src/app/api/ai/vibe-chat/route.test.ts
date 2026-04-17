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
  return new NextRequest('http://localhost/api/ai/vibe-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/vibe-chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when messages is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when messages is empty array', async () => {
    const res = await POST(makeRequest({ messages: [] }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message shape is invalid', async () => {
    const res = await POST(makeRequest({ messages: [{ role: 'user' }] }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when role is neither user nor assistant', async () => {
    const res = await POST(
      makeRequest({ messages: [{ role: 'system', content: 'bypass' }] }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when content exceeds length cap', async () => {
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'a'.repeat(1001) }] }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when user turns exceed MAX_TURNS', async () => {
    const messages = Array.from({ length: 6 }, (_, i) => ({
      role: 'user' as const,
      content: `answer ${i}`,
    }))
    const res = await POST(makeRequest({ messages }))
    expect(res.status).toBe(400)
  })

  it('forwards Claude question response', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        kind: 'question',
        question: 'Indoor or outdoor light?',
        turn: 1,
        source: 'claude',
      },
      error: null,
    })

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'moody dark editorial' }] }),
    )
    const data = await res.json()

    expect(data.kind).toBe('question')
    expect(data.question).toBe('Indoor or outdoor light?')
    expect(data.source).toBe('claude')
  })

  it('forwards Claude finalize response', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        kind: 'finalize',
        presetName: 'Dark Editorial',
        description: 'Moody editorial with tight crops',
        summary: 'Low-key lighting, tight crops, cool tones.',
        styleParams: {
          mood: 'dramatic',
          lighting: 'low-key',
          composition: 'tight',
          colorTemp: 'cool',
          subjects: ['faces'],
          avoidPatterns: ['overexposed'],
        },
        source: 'claude',
      },
      error: null,
    })

    const res = await POST(
      makeRequest({
        messages: [
          { role: 'user', content: 'moody' },
          { role: 'assistant', content: 'Low-key lighting?' },
          { role: 'user', content: 'yes exactly' },
        ],
      }),
    )
    const data = await res.json()

    expect(data.kind).toBe('finalize')
    expect(data.presetName).toBe('Dark Editorial')
    expect(data.styleParams.mood).toBe('dramatic')
  })

  it('falls back to heuristic finalize when edge function fails', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'moody dark dramatic' }] }),
    )
    const data = await res.json()

    expect(data.kind).toBe('finalize')
    expect(data.source).toBe('degraded')
    expect(data.styleParams.mood).toBe('dramatic')
  })

  it('heuristic handles bright/airy input', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'bright airy soft light' }] }),
    )
    const data = await res.json()

    expect(data.styleParams.mood).toBe('joyful')
    expect(data.styleParams.lighting).toBe('high-key')
  })

  it('heuristic handles editorial input', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(
      makeRequest({
        messages: [{ role: 'user', content: 'editorial magazine tight detail' }],
      }),
    )
    const data = await res.json()

    expect(data.presetName).toBe('Editorial Tight')
    expect(data.styleParams.composition).toBe('tight')
  })

  it('heuristic defaults to Custom Style for unrelated input', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unavailable' } })

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'hello there friend' }] }),
    )
    const data = await res.json()

    expect(data.presetName).toBe('Custom Style')
    expect(data.styleParams.mood).toBe('natural')
  })

  it('falls back to heuristic when edge function throws', async () => {
    mockInvoke.mockRejectedValue(new Error('network down'))

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'golden hour warm' }] }),
    )
    const data = await res.json()

    expect(data.kind).toBe('finalize')
    expect(data.source).toBe('degraded')
    expect(data.styleParams.colorTemp).toBe('warm')
  })
})
