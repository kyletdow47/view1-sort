import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInvoke = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  }),
}))

import { GET } from './route'

describe('GET /api/ai/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns connected when edge function succeeds', async () => {
    mockInvoke.mockResolvedValue({
      data: { insights: ['test'], source: 'claude' },
      error: null,
    })

    const res = await GET()
    const data = await res.json()

    expect(data.status).toBe('connected')
    expect(data.message).toContain('connected')
  })

  it('returns not_configured when API key is missing', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'ANTHROPIC_API_KEY not configured' },
    })

    const res = await GET()
    const data = await res.json()

    expect(data.status).toBe('not_configured')
    expect(data.message).toContain('ANTHROPIC_API_KEY')
  })

  it('returns error on other edge function failures', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Function timeout' },
    })

    const res = await GET()
    const data = await res.json()

    expect(data.status).toBe('error')
    expect(data.message).toContain('Function timeout')
  })

  it('returns error when function throws', async () => {
    mockInvoke.mockRejectedValue(new Error('Connection refused'))

    const res = await GET()
    const data = await res.json()

    expect(data.status).toBe('error')
    expect(data.message).toContain('Connection refused')
  })
})
