import { beforeEach, describe, expect, it, vi } from 'vitest'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

import {
  __resetStockCache,
  clearTrainerDone,
  isTrainerDone,
  loadStockManifest,
  markTrainerDone,
  sampleTrainerPhotos,
  verdictAccepted,
} from '../onboarding-trainer'
import type { StockManifest } from '@/types/onboarding-trainer'

function mockManifest(): StockManifest {
  const entries = []
  const categories = [
    'Getting Ready',
    'Ceremony',
    'First Look',
    'Portraits',
    'Family',
    'Reception',
    'Details',
    'Candids',
  ]
  for (const category of categories) {
    for (let i = 0; i < 15; i++) {
      entries.push({
        preset: 'wedding',
        category,
        url: `https://example.com/${category}-${i}.jpg`,
        pexelsId: 1_000_000 + category.length * 100 + i,
        credit: 'Tester',
        creditUrl: 'https://example.com',
      })
    }
  }
  return { generatedAt: '2026-04-15T00:00:00Z', perCategory: 15, entries }
}

describe('sampleTrainerPhotos', () => {
  it('returns exactly 20 photos spread across categories', () => {
    const photos = sampleTrainerPhotos(mockManifest(), 'wedding', 20, 42)
    expect(photos).toHaveLength(20)
    const categories = new Set(photos.map((p) => p.category))
    expect(categories.size).toBeGreaterThanOrEqual(5)
  })

  it('is deterministic for the same seed', () => {
    const a = sampleTrainerPhotos(mockManifest(), 'wedding', 20, 7)
    const b = sampleTrainerPhotos(mockManifest(), 'wedding', 20, 7)
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id))
  })

  it('returns empty for unknown preset', () => {
    expect(sampleTrainerPhotos(mockManifest(), 'does-not-exist', 20, 1)).toEqual([])
  })

  it('returns empty when preset has no stock entries', () => {
    const manifest: StockManifest = { generatedAt: '', perCategory: 0, entries: [] }
    expect(sampleTrainerPhotos(manifest, 'wedding', 20, 1)).toEqual([])
  })

  it('each photo has category, url, and stable id', () => {
    const [first] = sampleTrainerPhotos(mockManifest(), 'wedding', 20, 3)
    expect(first.id).toMatch(/^wedding:\d+$/)
    expect(first.url).toContain('https://')
    expect(first.category.length).toBeGreaterThan(0)
  })
})

describe('isTrainerDone / markTrainerDone', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('defaults to not-done', () => {
    expect(isTrainerDone('user-1', 'wedding')).toBe(false)
  })

  it('mark + read round-trip, scoped per preset', () => {
    markTrainerDone('user-1', 'wedding')
    expect(isTrainerDone('user-1', 'wedding')).toBe(true)
    expect(isTrainerDone('user-1', 'real-estate')).toBe(false)
    expect(isTrainerDone('user-2', 'wedding')).toBe(false)
  })

  it('clearTrainerDone removes one preset', () => {
    markTrainerDone('user-1', 'wedding')
    markTrainerDone('user-1', 'event')
    clearTrainerDone('user-1', 'wedding')
    expect(isTrainerDone('user-1', 'wedding')).toBe(false)
    expect(isTrainerDone('user-1', 'event')).toBe(true)
  })
})

describe('verdictAccepted', () => {
  it('maps keep → true, reject → false', () => {
    expect(verdictAccepted('keep')).toBe(true)
    expect(verdictAccepted('reject')).toBe(false)
  })
})

describe('loadStockManifest', () => {
  beforeEach(() => {
    __resetStockCache()
  })

  it('fetches and caches the manifest', async () => {
    const manifest = mockManifest()
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => manifest,
    } as Response)
    const a = await loadStockManifest(fetcher as unknown as typeof fetch)
    const b = await loadStockManifest(fetcher as unknown as typeof fetch)
    expect(a).toBe(b)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('throws on non-ok response', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response)
    await expect(
      loadStockManifest(fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/404/)
  })
})
