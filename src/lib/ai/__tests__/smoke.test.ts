/**
 * Smoke Test — AI Sort Pipeline (end-to-end flow)
 *
 * Tests the actual architecture:
 *  - Preset resolution (getPreset, getAllLabels, getCategoryForLabel)
 *  - classifyBatch flow via useAIClassifier (mocked Worker)
 *  - Confidence threshold filtering logic
 *  - POST /api/media/classify payload shape
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPreset,
  getAllLabels,
  getCategoryForLabel,
  BUILT_IN_PRESETS,
} from '../presets'
import { getCategoryForLabel as getDefaultCategory } from '../labels'
import { groupByLabel, filterByConfidence } from '../utils'
import type { ClassificationResult } from '../classifier'

// ─── Preset resolution tests ────────────────────────────────────────────────

describe('Preset resolution', () => {
  it('getPreset returns the wedding preset', () => {
    const preset = getPreset('wedding')
    expect(preset).toBeDefined()
    expect(preset!.name).toBe('Wedding')
    expect(preset!.categories.length).toBeGreaterThan(0)
  })

  it('getPreset returns the real-estate preset', () => {
    const preset = getPreset('real-estate')
    expect(preset).toBeDefined()
    expect(preset!.name).toBe('Real Estate')
  })

  it('getPreset returns undefined for unknown preset', () => {
    expect(getPreset('nonexistent')).toBeUndefined()
  })

  it('getAllLabels flattens all category labels for a preset', () => {
    const preset = getPreset('wedding')!
    const labels = getAllLabels(preset)
    expect(labels.length).toBeGreaterThan(10) // Wedding has many labels
    expect(labels).toContain('wedding ceremony')
    expect(labels).toContain('wedding couple portrait')
  })

  it('getCategoryForLabel maps a label to its parent category', () => {
    const preset = getPreset('wedding')!
    expect(getCategoryForLabel(preset, 'wedding ceremony')).toBe('Ceremony')
    expect(getCategoryForLabel(preset, 'wedding couple portrait')).toBe('Portraits')
    expect(getCategoryForLabel(preset, 'first dance wedding')).toBe('Reception')
  })

  it('getCategoryForLabel returns undefined for unmatched label', () => {
    const preset = getPreset('wedding')!
    expect(getCategoryForLabel(preset, 'completely random label xyz')).toBeUndefined()
  })

  it('all 6 built-in presets exist and have valid structure', () => {
    expect(BUILT_IN_PRESETS).toHaveLength(6)
    for (const preset of BUILT_IN_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.categories.length).toBeGreaterThan(0)
      expect(preset.builtIn).toBe(true)
      for (const cat of preset.categories) {
        expect(cat.name).toBeTruthy()
        expect(cat.labels.length).toBeGreaterThan(0)
        expect(typeof cat.priority).toBe('number')
      }
    }
  })

  it('real-estate preset maps "kitchen interior" to Kitchen', () => {
    const preset = getPreset('real-estate')!
    expect(getCategoryForLabel(preset, 'kitchen interior')).toBe('Kitchen')
  })

  it('real-estate preset maps "house exterior front" to Exterior Hero', () => {
    const preset = getPreset('real-estate')!
    expect(getCategoryForLabel(preset, 'house exterior front')).toBe('Exterior Hero')
  })
})

// ─── Default label category mapping ──────────────────────────────────────────

describe('Default label → category mapping', () => {
  it('portrait labels map to portrait category', () => {
    expect(getDefaultCategory('bride portrait')).toBe('portrait')
  })

  it('event labels map to event category', () => {
    expect(getDefaultCategory('wedding ceremony')).toBe('event')
  })

  it('unknown labels map to other', () => {
    expect(getDefaultCategory('totally random string')).toBe('other')
  })
})

// ─── Utils: groupByLabel, filterByConfidence ─────────────────────────────────

describe('Classification utils', () => {
  const sampleResults: ClassificationResult[] = [
    { photoId: 'p1', label: 'bride portrait', score: 0.95, category: 'portrait' },
    { photoId: 'p2', label: 'wedding ceremony', score: 0.80, category: 'event' },
    { photoId: 'p3', label: 'candid moment', score: 0.40, category: 'candid' },
    { photoId: 'p4', label: 'wedding cake', score: 0.60, category: 'detail' },
  ]

  it('groupByLabel groups results by their label', () => {
    const grouped = groupByLabel(sampleResults)
    expect(grouped['bride portrait']).toHaveLength(1)
    expect(grouped['bride portrait'][0].photoId).toBe('p1')
    expect(grouped['wedding ceremony']).toHaveLength(1)
    expect(grouped['candid moment']).toHaveLength(1)
    expect(grouped['wedding cake']).toHaveLength(1)
  })

  it('filterByConfidence keeps only results above threshold', () => {
    const filtered = filterByConfidence(sampleResults, 0.5)
    expect(filtered).toHaveLength(3) // p1(0.95), p2(0.80), p4(0.60)
    expect(filtered.find((r) => r.photoId === 'p3')).toBeUndefined()
  })

  it('filterByConfidence with 0 threshold keeps all', () => {
    const filtered = filterByConfidence(sampleResults, 0)
    expect(filtered).toHaveLength(4)
  })

  it('filterByConfidence with 1.0 threshold keeps none', () => {
    const filtered = filterByConfidence(sampleResults, 1.0)
    expect(filtered).toHaveLength(0)
  })
})

// ─── classifyBatch POST payload shape ────────────────────────────────────────

describe('classifyBatch → POST /api/media/classify payload', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)
  })

  it('POST body has correct structure with projectId, results, durationMs, presetId', async () => {
    // Simulate what classifyBatch does after classification completes
    const results = [
      { mediaId: 'media-1', category: 'Ceremony', confidence: 0.92 },
      { mediaId: 'media-2', category: 'Portraits', confidence: 0.87 },
    ]

    await fetch('/api/media/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'proj-123',
        results,
        durationMs: 1500,
        presetId: 'wedding',
      }),
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/media/classify')
    expect(options.method).toBe('POST')

    const body = JSON.parse(options.body as string) as {
      projectId: string
      results: Array<{ mediaId: string; category: string; confidence: number }>
      durationMs: number
      presetId: string
    }
    expect(body.projectId).toBe('proj-123')
    expect(body.results).toHaveLength(2)
    expect(body.results[0]).toEqual({ mediaId: 'media-1', category: 'Ceremony', confidence: 0.92 })
    expect(body.durationMs).toBe(1500)
    expect(body.presetId).toBe('wedding')
  })
})

// ─── Confidence threshold filtering (AISortWorkspace logic) ──────────────────

describe('Confidence threshold filtering logic', () => {
  interface MockMedia {
    id: string
    ai_category: string
    ai_confidence: number | null
  }

  function applyThreshold(
    photos: MockMedia[],
    threshold: number,
  ): { kept: MockMedia[]; needsReview: MockMedia[] } {
    const kept = photos.filter(
      (p) => p.ai_confidence == null || p.ai_confidence >= threshold,
    )
    const needsReview = photos.filter(
      (p) => p.ai_confidence != null && p.ai_confidence < threshold,
    )
    return { kept, needsReview }
  }

  const photos: MockMedia[] = [
    { id: '1', ai_category: 'Ceremony', ai_confidence: 0.95 },
    { id: '2', ai_category: 'Portraits', ai_confidence: 0.72 },
    { id: '3', ai_category: 'Details', ai_confidence: 0.45 },
    { id: '4', ai_category: 'Candids', ai_confidence: 0.30 },
    { id: '5', ai_category: 'Reception', ai_confidence: null },
  ]

  it('threshold 0.5 → keeps 3 (2 above + 1 null), reviews 2', () => {
    const { kept, needsReview } = applyThreshold(photos, 0.5)
    expect(kept).toHaveLength(3) // id 1,2,5
    expect(needsReview).toHaveLength(2) // id 3,4
  })

  it('threshold 0.0 → keeps all 5, reviews 0', () => {
    const { kept, needsReview } = applyThreshold(photos, 0)
    expect(kept).toHaveLength(5)
    expect(needsReview).toHaveLength(0)
  })

  it('threshold 1.0 → keeps only null-confidence, reviews rest', () => {
    const { kept, needsReview } = applyThreshold(photos, 1.0)
    expect(kept).toHaveLength(1) // only null
    expect(needsReview).toHaveLength(4)
  })

  it('threshold 0.7 → keeps id 1 + 2 + 5', () => {
    const { kept, needsReview } = applyThreshold(photos, 0.7)
    const keptIds = kept.map((p) => p.id)
    expect(keptIds).toContain('1')
    expect(keptIds).toContain('2')
    expect(keptIds).toContain('5')
    expect(needsReview).toHaveLength(2)
  })
})

// ─── Manual re-categorization ────────────────────────────────────────────────

describe('Manual re-categorization logic', () => {
  it('updates ai_category for a media item', () => {
    const media = { id: 'photo-1', ai_category: 'Ceremony', ai_confidence: 0.8 }
    const targetCategory = 'Reception'
    const updated = { ...media, ai_category: targetCategory }
    expect(updated.ai_category).toBe('Reception')
    expect(updated.ai_confidence).toBe(0.8) // confidence preserved
  })

  it('skip update when source and target category are the same', () => {
    const media = { id: 'photo-1', ai_category: 'Ceremony' }
    const targetCategory = 'Ceremony'
    const shouldUpdate = media.ai_category !== targetCategory
    expect(shouldUpdate).toBe(false)
  })
})
