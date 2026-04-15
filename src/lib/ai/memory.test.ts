import { describe, it, expect, vi } from 'vitest'
import {
  applyCorrection,
  applyAcceptance,
  buildMemoryContext,
} from './memory'
import type { SortProfile } from './memory'
import type { SupabaseClient } from '@supabase/supabase-js'

function emptyProfile(): SortProfile {
  return {
    id: '',
    userId: 'user-1',
    categoryWeights: {},
    labelWeights: {},
    preferredCategories: [],
    feedbackCount: 0,
    lastSortAt: null,
  }
}

describe('applyCorrection', () => {
  it('decreases weight for the wrong category and increases for the correct one', () => {
    const profile = emptyProfile()
    const updated = applyCorrection(profile, 'portraits', 'details', 'jewelry ring close-up')

    // Both categories stored lowercased
    expect(updated.categoryWeights['portraits']).toBeLessThan(1.0)
    expect(updated.categoryWeights['details']).toBeGreaterThan(1.0)
    expect(updated.feedbackCount).toBe(1)
  })

  it('stores label-level weights keyed by "category:label"', () => {
    const profile = emptyProfile()
    const updated = applyCorrection(profile, 'Portraits', 'Details', 'jewelry ring')
    const key = Object.keys(updated.labelWeights).find((k) => k.startsWith('details:'))
    expect(key).toBeDefined()
    expect(updated.labelWeights[key!]).toBeGreaterThan(1.0)
  })

  it('clamps weights to the [0.2, 2.0] range over many corrections', () => {
    let profile = emptyProfile()
    // Push "landscape" up repeatedly
    for (let i = 0; i < 40; i++) {
      profile = applyCorrection(profile, 'event', 'landscape', 'mountain photo')
    }
    expect(profile.categoryWeights['landscape']).toBeLessThanOrEqual(2.0)
    expect(profile.categoryWeights['event']).toBeGreaterThanOrEqual(0.2)
  })

  it('does not mutate the input profile', () => {
    const profile = emptyProfile()
    const before = JSON.stringify(profile)
    applyCorrection(profile, 'portrait', 'detail', 'ring')
    expect(JSON.stringify(profile)).toBe(before)
  })

  it('handles corrections without a label cleanly', () => {
    const profile = emptyProfile()
    const updated = applyCorrection(profile, 'portrait', 'detail', '')
    expect(updated.categoryWeights['detail']).toBeGreaterThan(1.0)
    expect(Object.keys(updated.labelWeights)).toHaveLength(0)
  })
})

describe('applyAcceptance', () => {
  it('increases weight for the accepted category', () => {
    const profile = emptyProfile()
    const updated = applyAcceptance(profile, 'portrait', 'portrait photograph')
    expect(updated.categoryWeights['portrait']).toBeGreaterThan(1.0)
    expect(updated.feedbackCount).toBe(1)
  })

  it('lowercases category keys', () => {
    const profile = emptyProfile()
    const updated = applyAcceptance(profile, 'Portrait', 'label')
    expect(updated.categoryWeights['portrait']).toBeDefined()
    expect(updated.categoryWeights['Portrait']).toBeUndefined()
  })

  it('converges toward the accept target (1.5) with repeated acceptances', () => {
    let profile = emptyProfile()
    for (let i = 0; i < 50; i++) {
      profile = applyAcceptance(profile, 'portrait', 'label')
    }
    // Should converge to WEIGHT_ACCEPT_TARGET = 1.5
    expect(profile.categoryWeights['portrait']).toBeCloseTo(1.5, 1)
  })
})

/* ── buildMemoryContext ───────────────────────────────────────────────── */

interface MockQueryResult {
  data: unknown
  error: null
}

function mockSupabase(profileRow: unknown, sessionRows: unknown[]): SupabaseClient {
  const fromImpl = (table: string) => {
    if (table === 'sort_profiles') {
      return {
        select: () => ({
          eq: () => ({
            single: (): Promise<MockQueryResult> =>
              Promise.resolve({ data: profileRow, error: null }),
          }),
        }),
      }
    }
    if (table === 'sort_sessions') {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: (): Promise<MockQueryResult> =>
                Promise.resolve({ data: sessionRows, error: null }),
            }),
          }),
        }),
      }
    }
    throw new Error(`Unexpected table: ${table}`)
  }
  return { from: fromImpl } as unknown as SupabaseClient
}

describe('buildMemoryContext', () => {
  it('returns an onboarding message for a new photographer', async () => {
    const supabase = mockSupabase(null, [])
    const context = await buildMemoryContext(supabase, 'user-1')
    expect(context).toMatch(/new photographer/i)
  })

  it('summarizes sort count, common categories, and avg photo count', async () => {
    const supabase = mockSupabase(
      {
        id: 'p1',
        user_id: 'user-1',
        category_weights: {},
        label_weights: {},
        preferred_categories: [],
        feedback_count: 5,
        last_sort_at: '2026-04-10T00:00:00Z',
      },
      [
        {
          id: 's1',
          project_id: 'proj-1',
          user_id: 'user-1',
          brief_text: 'wedding',
          batch_summary: {},
          sort_plan: {},
          categories_used: ['Portraits', 'Details', 'Venue'],
          photo_count: 400,
          corrections: [{ photoId: 'p1', fromCategory: 'A', toCategory: 'B', timestamp: 1 }],
          created_at: '2026-04-10T00:00:00Z',
        },
        {
          id: 's2',
          project_id: 'proj-2',
          user_id: 'user-1',
          brief_text: 'wedding',
          batch_summary: {},
          sort_plan: {},
          categories_used: ['Portraits', 'Details'],
          photo_count: 300,
          corrections: [],
          created_at: '2026-04-09T00:00:00Z',
        },
      ]
    )

    const context = await buildMemoryContext(supabase, 'user-1')
    expect(context).toMatch(/2 sort sessions/)
    expect(context).toMatch(/Portraits/)
    expect(context).toMatch(/Details/)
    expect(context).toMatch(/Average upload size: 350 photos/)
    expect(context).toMatch(/Correction rate/)
  })

  it('flags strong category preferences', async () => {
    const supabase = mockSupabase(
      {
        id: 'p1',
        user_id: 'user-1',
        category_weights: { portrait: 1.8, rejected: 0.4 },
        label_weights: {},
        preferred_categories: [],
        feedback_count: 10,
        last_sort_at: null,
      },
      []
    )
    const context = await buildMemoryContext(supabase, 'user-1')
    expect(context).toMatch(/Strong preferences/)
    expect(context).toMatch(/prefers "portrait"/)
    expect(context).toMatch(/avoids "rejected"/)
  })
})
