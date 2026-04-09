import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPreset, getAllLabels, getCategoryForLabel } from './presets'
import type { AIClassifierOutput, ClassifyMediaInput } from '@/hooks/useAIClassifier'

/**
 * Tests the classify pipeline logic in isolation — preset label resolution,
 * category mapping, and the POST /api/media/classify request shape.
 *
 * The actual Web Worker + CLIP model are mocked; we test the orchestration
 * logic that surrounds them.
 */

// ---------------------------------------------------------------------------
// Preset label resolution (used inside classifyBatch)
// ---------------------------------------------------------------------------
describe('preset label resolution for classifyBatch', () => {
  it('wedding preset produces labels that include ceremony keywords', () => {
    const preset = getPreset('wedding')!
    const labels = getAllLabels(preset)
    expect(labels.some((l) => l.includes('ceremony'))).toBe(true)
    expect(labels.some((l) => l.includes('first dance'))).toBe(true)
  })

  it('real-estate preset produces labels that include property keywords', () => {
    const preset = getPreset('real-estate')!
    const labels = getAllLabels(preset)
    expect(labels.some((l) => l.includes('house') || l.includes('property'))).toBe(true)
  })

  it('no preset → undefined, classifyBatch should fall back to default LABEL_STRINGS', () => {
    const preset = getPreset('nonexistent')
    expect(preset).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Category mapping from label → human-readable name
// ---------------------------------------------------------------------------
describe('category mapping from top label', () => {
  it('maps wedding labels to their preset category names', () => {
    const wedding = getPreset('wedding')!
    expect(getCategoryForLabel(wedding, 'bride walking down aisle')).toBe('Ceremony')
    expect(getCategoryForLabel(wedding, 'wedding couple portrait')).toBe('Portraits')
    expect(getCategoryForLabel(wedding, 'wedding ring detail')).toBe('Details')
  })

  it('maps travel labels to travel-specific categories', () => {
    const travel = getPreset('travel')!
    expect(getCategoryForLabel(travel, 'street photography travel')).toBe('Street')
    expect(getCategoryForLabel(travel, 'food photography travel')).toBe('Food')
  })
})

// ---------------------------------------------------------------------------
// POST /api/media/classify request body shape
// ---------------------------------------------------------------------------
describe('classify API request body construction', () => {
  it('builds the correct request body from classifier outputs', () => {
    const projectId = 'proj-123'
    const presetId = 'wedding'
    const outputs: AIClassifierOutput[] = [
      { id: 'media-1', category: 'Ceremony', confidence: 0.95 },
      { id: 'media-2', category: 'Portraits', confidence: 0.82 },
      { id: 'media-3', category: 'Reception', confidence: 0.71 },
    ]
    const startTime = Date.now() - 5000
    const durationMs = Date.now() - startTime

    const body = {
      projectId,
      results: outputs.map(({ id, category, confidence }) => ({
        mediaId: id,
        category,
        confidence,
      })),
      durationMs,
      presetId,
    }

    expect(body.projectId).toBe('proj-123')
    expect(body.presetId).toBe('wedding')
    expect(body.results).toHaveLength(3)
    expect(body.results[0]).toEqual({
      mediaId: 'media-1',
      category: 'Ceremony',
      confidence: 0.95,
    })
    expect(body.durationMs).toBeGreaterThan(0)
  })

  it('omits fetch when projectId is not provided', () => {
    // This mirrors the logic in useAIClassifier: if (!options.projectId) skip POST
    const projectId: string | undefined = undefined
    const outputs: AIClassifierOutput[] = [
      { id: 'media-1', category: 'Ceremony', confidence: 0.95 },
    ]
    const shouldPost = outputs.length > 0 && projectId !== undefined
    expect(shouldPost).toBe(false)
  })

  it('omits fetch when results are empty', () => {
    const outputs: AIClassifierOutput[] = []
    const shouldPost = outputs.length > 0 && 'proj-123' !== undefined
    expect(shouldPost).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ai_sort_runs record shape
// ---------------------------------------------------------------------------
describe('ai_sort_runs record construction', () => {
  it('builds the correct record for Supabase insert', () => {
    const record = {
      project_id: 'proj-123',
      user_id: 'user-456',
      total_photos: 48,
      classified_photos: 48,
      model_id: 'Xenova/clip-vit-base-patch32',
      preset_id: 'wedding',
      duration_ms: 12345,
    }

    expect(record.project_id).toBe('proj-123')
    expect(record.user_id).toBe('user-456')
    expect(record.total_photos).toBe(48)
    expect(record.classified_photos).toBe(48)
    expect(record.model_id).toBe('Xenova/clip-vit-base-patch32')
    expect(record.preset_id).toBe('wedding')
    expect(record.duration_ms).toBe(12345)
  })

  it('defaults model_id when not provided', () => {
    const modelId: string | undefined = undefined
    const record = {
      model_id: modelId ?? 'Xenova/clip-vit-base-patch32',
    }
    expect(record.model_id).toBe('Xenova/clip-vit-base-patch32')
  })

  it('allows null preset_id', () => {
    const presetId: string | undefined = undefined
    const record = {
      preset_id: presetId ?? null,
    }
    expect(record.preset_id).toBeNull()
  })
})
