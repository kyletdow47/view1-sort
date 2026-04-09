import { describe, it, expect } from 'vitest'
import type { MediaItem } from '@/types/media'

/**
 * Tests for confidence threshold filtering logic used in AISortWorkspace.
 * This replicates the filtering logic from AISortWorkspace's useMemo to
 * validate it in isolation.
 */

// Helper that mirrors the filtering in AISortWorkspace
function filterByThreshold(
  photos: MediaItem[],
  threshold: number,
): { above: MediaItem[]; below: MediaItem[] } {
  const normalized = threshold / 100
  const above = photos.filter(
    (p) => p.ai_confidence == null || p.ai_confidence >= normalized,
  )
  const below = photos.filter(
    (p) => p.ai_confidence != null && p.ai_confidence < normalized,
  )
  return { above, below }
}

// Fixtures
function makePhoto(id: string, confidence: number | null): MediaItem {
  return {
    id,
    filename: `${id}.jpg`,
    thumbnail_url: `https://example.com/${id}.jpg`,
    cloudflare_image_id: null,
    ai_category: 'Ceremony',
    ai_confidence: confidence,
    orientation: null,
    is_blurry: false,
    is_duplicate: false,
    is_overexposed: false,
    is_underexposed: false,
    culling_confidence: null,
    is_starred: false,
    review_flag: null,
  }
}

const PHOTOS: MediaItem[] = [
  makePhoto('p1', 0.95),  // 95% — high
  makePhoto('p2', 0.82),  // 82% — medium
  makePhoto('p3', 0.70),  // 70% — medium
  makePhoto('p4', 0.45),  // 45% — low
  makePhoto('p5', 0.30),  // 30% — low
  makePhoto('p6', null),  // unclassified
]

describe('confidence threshold filtering', () => {
  it('at threshold 70, keeps photos >= 0.70 and null-confidence photos', () => {
    const { above, below } = filterByThreshold(PHOTOS, 70)
    expect(above).toHaveLength(4) // p1, p2, p3 (>= 0.70), p6 (null)
    expect(below).toHaveLength(2) // p4, p5
  })

  it('at threshold 0, keeps all photos', () => {
    const { above, below } = filterByThreshold(PHOTOS, 0)
    expect(above).toHaveLength(6)
    expect(below).toHaveLength(0)
  })

  it('at threshold 100, only keeps null-confidence photos', () => {
    const { above, below } = filterByThreshold(PHOTOS, 100)
    expect(above).toHaveLength(1) // only p6 (null)
    expect(below).toHaveLength(5)
  })

  it('at threshold 90, separates high from medium/low', () => {
    const { above, below } = filterByThreshold(PHOTOS, 90)
    expect(above.map((p) => p.id).sort()).toEqual(['p1', 'p6'])
    expect(below).toHaveLength(4)
  })

  it('photos with null confidence always stay above threshold', () => {
    const nullPhotos = [makePhoto('n1', null), makePhoto('n2', null)]
    const { above } = filterByThreshold(nullPhotos, 95)
    expect(above).toHaveLength(2)
  })

  it('handles empty array', () => {
    const { above, below } = filterByThreshold([], 50)
    expect(above).toHaveLength(0)
    expect(below).toHaveLength(0)
  })
})
