import { describe, it, expect, beforeEach } from 'vitest'
import { useMediaStore } from '../mediaStore'
import type { ClassificationResult } from '@/lib/ai/classifier-v2'

const makeResult = (category = 'kitchen'): ClassificationResult => ({
  category,
  confidence: 0.8,
  predictions: [{ className: 'refrigerator', probability: 0.8 }],
  allScores: {},
})

// Reset classification state before each test
beforeEach(() => {
  useMediaStore.setState({
    classificationStatus: {},
    classificationErrors: {},
    classificationResults: {},
  })
})

// ─── setClassificationPending ─────────────────────────────────────────────────

describe('setClassificationPending', () => {
  it('sets status to pending for the given mediaId', () => {
    useMediaStore.getState().setClassificationPending('m1')
    const { classificationStatus } = useMediaStore.getState()
    expect(classificationStatus['m1']).toBe('pending')
  })
})

// ─── setClassifying ───────────────────────────────────────────────────────────

describe('setClassifying', () => {
  it('sets status to classifying', () => {
    useMediaStore.getState().setClassifying('m1')
    expect(useMediaStore.getState().classificationStatus['m1']).toBe('classifying')
  })
})

// ─── setClassified ────────────────────────────────────────────────────────────

describe('setClassified', () => {
  it('sets status to classified and stores result', () => {
    const result = makeResult('exterior')
    useMediaStore.getState().setClassified('m1', result)
    const state = useMediaStore.getState()
    expect(state.classificationStatus['m1']).toBe('classified')
    expect(state.classificationResults['m1']).toEqual(result)
  })

  it('updates media item ai_category when the media item exists in store', () => {
    useMediaStore.setState({
      media: [
        {
          id: 'm1',
          project_id: 'p1',
          storage_path: 'path.jpg',
          filename: 'photo.jpg',
          mime_type: 'image/jpeg',
          size_bytes: 1024,
          width: null,
          height: null,
          orientation: 'landscape',
          cloudflare_image_id: null,
          thumbnail_url: null,
          watermarked_url: null,
          ai_category: null,
          ai_confidence: null,
          ai_labels: null,
          sort_order: 0,
          created_at: '2026-01-01T00:00:00Z',
          display_name: null,
        },
      ],
    })

    const result = makeResult('kitchen')
    useMediaStore.getState().setClassified('m1', result)

    const updated = useMediaStore.getState().media.find((m) => m.id === 'm1')
    expect(updated?.ai_category).toBe('kitchen')
    expect(updated?.ai_confidence).toBe(0.8)
  })
})

// ─── setClassificationFailed ──────────────────────────────────────────────────

describe('setClassificationFailed', () => {
  it('sets status to failed', () => {
    useMediaStore.getState().setClassificationFailed('m1', 'WebGL error')
    expect(useMediaStore.getState().classificationStatus['m1']).toBe('failed')
  })

  it('stores the error message', () => {
    useMediaStore.getState().setClassificationFailed('m1', 'WebGL error')
    expect(useMediaStore.getState().classificationErrors['m1']).toBe('WebGL error')
  })
})

// ─── getClassificationProgress ────────────────────────────────────────────────

describe('getClassificationProgress', () => {
  it('counts total, classified, pending, failed correctly', () => {
    useMediaStore.setState({
      classificationStatus: {
        m1: 'classified',
        m2: 'classified',
        m3: 'pending',
        m4: 'failed',
        m5: 'classifying',
      },
    })

    const progress = useMediaStore.getState().getClassificationProgress()
    expect(progress.total).toBe(5)
    expect(progress.classified).toBe(2)
    expect(progress.pending).toBe(1)
    expect(progress.failed).toBe(1)
  })

  it('returns all zeros when no classifications have started', () => {
    const progress = useMediaStore.getState().getClassificationProgress()
    expect(progress).toEqual({ total: 0, classified: 0, pending: 0, failed: 0 })
  })
})

// ─── retryFailedClassifications ──────────────────────────────────────────────

describe('retryFailedClassifications', () => {
  it('resets failed items to pending and returns their ids', () => {
    useMediaStore.setState({
      classificationStatus: {
        m1: 'classified',
        m2: 'failed',
        m3: 'failed',
      },
    })

    const retried = useMediaStore.getState().retryFailedClassifications()
    expect(retried.sort()).toEqual(['m2', 'm3'])

    const { classificationStatus } = useMediaStore.getState()
    expect(classificationStatus['m1']).toBe('classified')
    expect(classificationStatus['m2']).toBe('pending')
    expect(classificationStatus['m3']).toBe('pending')
  })

  it('returns empty array when no failures', () => {
    useMediaStore.setState({ classificationStatus: { m1: 'classified' } })
    const retried = useMediaStore.getState().retryFailedClassifications()
    expect(retried).toEqual([])
  })
})
