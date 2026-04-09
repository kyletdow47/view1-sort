import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadStyleProfile,
  recordFeedback,
  applyPersonalization,
  progressToUnlock,
  topCategories,
  UNLOCK_THRESHOLD,
  type StyleProfile,
} from './style-profile'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock fetch for Supabase sync
globalThis.fetch = vi.fn(() =>
  Promise.resolve(new Response(JSON.stringify({ profile: {} }), { status: 200 })),
)

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('loadStyleProfile', () => {
  it('returns empty profile for unknown user', () => {
    const profile = loadStyleProfile('user-1')
    expect(profile.userId).toBe('user-1')
    expect(profile.feedbackCount).toBe(0)
    expect(profile.personalizedModeUnlocked).toBe(false)
    expect(profile.categoryWeights).toEqual({})
  })

  it('loads previously saved profile from localStorage', () => {
    const saved: StyleProfile = {
      userId: 'user-2',
      feedbackCount: 10,
      personalizedModeUnlocked: false,
      categoryWeights: { 'wedding:Ceremony': 1.2 },
      lastUpdated: Date.now(),
    }
    localStorageMock.setItem('v1-style-profile:user-2', JSON.stringify(saved))
    const profile = loadStyleProfile('user-2')
    expect(profile.feedbackCount).toBe(10)
    expect(profile.categoryWeights['wedding:Ceremony']).toBe(1.2)
  })
})

describe('recordFeedback', () => {
  it('increments feedback count by 1', () => {
    const profile = recordFeedback('user-1', 'wedding', 'Ceremony', true)
    expect(profile.feedbackCount).toBe(1)
  })

  it('increases weight when accepted', () => {
    const profile = recordFeedback('user-1', 'wedding', 'Ceremony', true)
    expect(profile.categoryWeights['wedding:Ceremony']).toBeCloseTo(1.1, 5)
  })

  it('decreases weight when rejected', () => {
    const profile = recordFeedback('user-1', 'wedding', 'Ceremony', false)
    expect(profile.categoryWeights['wedding:Ceremony']).toBeCloseTo(0.9, 5)
  })

  it('clamps weight to minimum 0.2', () => {
    // Start from 0 adjustments, weight defaults to 1.0
    // Need to reject 9 times: 1.0 - 0.9 = 0.1, but clamped to 0.2
    let profile: StyleProfile = loadStyleProfile('user-1')
    for (let i = 0; i < 10; i++) {
      profile = recordFeedback('user-1', 'wedding', 'Portraits', false)
    }
    expect(profile.categoryWeights['wedding:Portraits']).toBeGreaterThanOrEqual(0.2)
  })

  it('clamps weight to maximum 2.0', () => {
    let profile: StyleProfile = loadStyleProfile('user-1')
    for (let i = 0; i < 15; i++) {
      profile = recordFeedback('user-1', 'wedding', 'Portraits', true)
    }
    expect(profile.categoryWeights['wedding:Portraits']).toBeLessThanOrEqual(2.0)
  })

  it('unlocks personalized mode after threshold feedback', () => {
    let profile: StyleProfile = loadStyleProfile('user-1')
    for (let i = 0; i < UNLOCK_THRESHOLD; i++) {
      profile = recordFeedback('user-1', 'wedding', 'Ceremony', true)
    }
    expect(profile.personalizedModeUnlocked).toBe(true)
    expect(profile.feedbackCount).toBe(UNLOCK_THRESHOLD)
  })

  it('does not unlock before threshold', () => {
    let profile: StyleProfile = loadStyleProfile('user-1')
    for (let i = 0; i < UNLOCK_THRESHOLD - 1; i++) {
      profile = recordFeedback('user-1', 'wedding', 'Ceremony', true)
    }
    expect(profile.personalizedModeUnlocked).toBe(false)
  })

  it('saves to localStorage after each feedback', () => {
    recordFeedback('user-1', 'wedding', 'Ceremony', true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'v1-style-profile:user-1',
      expect.any(String),
    )
  })
})

describe('applyPersonalization', () => {
  it('returns results unchanged when mode is not unlocked', () => {
    const profile: StyleProfile = {
      userId: 'user-1',
      feedbackCount: 5,
      personalizedModeUnlocked: false,
      categoryWeights: { 'wedding:Ceremony': 2.0 },
      lastUpdated: Date.now(),
    }
    const results = [
      { category: 'Ceremony', score: 0.8 },
      { category: 'Reception', score: 0.9 },
    ]
    const reranked = applyPersonalization(results, profile, 'wedding')
    expect(reranked).toEqual(results) // same reference when not unlocked
  })

  it('scales scores by category weights when unlocked', () => {
    const profile: StyleProfile = {
      userId: 'user-1',
      feedbackCount: 25,
      personalizedModeUnlocked: true,
      categoryWeights: {
        'wedding:Ceremony': 1.5,
        'wedding:Reception': 0.5,
      },
      lastUpdated: Date.now(),
    }
    const results = [
      { category: 'Ceremony', score: 0.6 },
      { category: 'Reception', score: 0.9 },
    ]
    const reranked = applyPersonalization(results, profile, 'wedding')
    // Ceremony: 0.6 * 1.5 = 0.9, Reception: 0.9 * 0.5 = 0.45
    expect(reranked[0].category).toBe('Ceremony')
    expect(reranked[0].score).toBeCloseTo(0.9, 5)
    expect(reranked[1].category).toBe('Reception')
    expect(reranked[1].score).toBeCloseTo(0.45, 5)
  })

  it('sorts results by score descending after personalization', () => {
    const profile: StyleProfile = {
      userId: 'user-1',
      feedbackCount: 25,
      personalizedModeUnlocked: true,
      categoryWeights: {
        'preset:A': 2.0,
        'preset:B': 0.3,
        'preset:C': 1.5,
      },
      lastUpdated: Date.now(),
    }
    const results = [
      { category: 'A', score: 0.3 },
      { category: 'B', score: 0.9 },
      { category: 'C', score: 0.5 },
    ]
    const reranked = applyPersonalization(results, profile, 'preset')
    // A: 0.6, B: 0.27, C: 0.75
    expect(reranked[0].category).toBe('C')
    expect(reranked[1].category).toBe('A')
    expect(reranked[2].category).toBe('B')
  })

  it('uses default weight 1.0 for unknown categories', () => {
    const profile: StyleProfile = {
      userId: 'user-1',
      feedbackCount: 25,
      personalizedModeUnlocked: true,
      categoryWeights: {},
      lastUpdated: Date.now(),
    }
    const results = [{ category: 'Unknown', score: 0.7 }]
    const reranked = applyPersonalization(results, profile, 'preset')
    expect(reranked[0].score).toBeCloseTo(0.7, 5) // 0.7 * 1.0
  })
})

describe('progressToUnlock', () => {
  it('returns 0 for empty profile', () => {
    const profile: StyleProfile = {
      userId: 'u', feedbackCount: 0, personalizedModeUnlocked: false,
      categoryWeights: {}, lastUpdated: 0,
    }
    expect(progressToUnlock(profile)).toBe(0)
  })

  it('returns 50 at half threshold', () => {
    const profile: StyleProfile = {
      userId: 'u', feedbackCount: UNLOCK_THRESHOLD / 2, personalizedModeUnlocked: false,
      categoryWeights: {}, lastUpdated: 0,
    }
    expect(progressToUnlock(profile)).toBe(50)
  })

  it('caps at 100', () => {
    const profile: StyleProfile = {
      userId: 'u', feedbackCount: UNLOCK_THRESHOLD + 10, personalizedModeUnlocked: true,
      categoryWeights: {}, lastUpdated: 0,
    }
    expect(progressToUnlock(profile)).toBe(100)
  })
})

describe('topCategories', () => {
  it('returns top categories sorted by weight', () => {
    const profile: StyleProfile = {
      userId: 'u', feedbackCount: 30, personalizedModeUnlocked: true,
      categoryWeights: {
        'wedding:Ceremony': 1.8,
        'wedding:Reception': 1.2,
        'wedding:Portraits': 1.5,
        'wedding:Details': 0.8,
        'travel:Food': 1.9, // different preset
      },
      lastUpdated: 0,
    }
    const top = topCategories(profile, 'wedding', 3)
    expect(top).toEqual(['Ceremony', 'Portraits', 'Reception'])
  })

  it('returns empty array when no weights for preset', () => {
    const profile: StyleProfile = {
      userId: 'u', feedbackCount: 0, personalizedModeUnlocked: false,
      categoryWeights: {}, lastUpdated: 0,
    }
    expect(topCategories(profile, 'wedding')).toEqual([])
  })
})
