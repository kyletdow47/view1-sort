import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { classify, loadModel, resetModel } from './classifier'
import type { ClassificationResult } from './classifier'

// ---------------------------------------------------------------------------
// Mock @xenova/transformers
// vi.mock is hoisted, so we must declare the mock fn with vi.hoisted()
// ---------------------------------------------------------------------------
const { mockPipelineFn } = vi.hoisted(() => ({
  mockPipelineFn: vi.fn(),
}))

vi.mock('@huggingface/transformers', () => ({
  pipeline: vi.fn().mockResolvedValue(mockPipelineFn),
  env: {
    allowRemoteModels: true,
    useBrowserCache: true,
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeMockResults(
  labels: string[]
): Array<{ label: string; score: number }> {
  return labels.map((label, i) => ({
    label,
    score: 1 - i * 0.1,
  }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('loadModel', () => {
  beforeEach(() => resetModel())
  afterEach(() => resetModel())

  it('calls pipeline() with the correct task and model', async () => {
    const { pipeline } = await import('@huggingface/transformers')
    await loadModel()
    expect(pipeline).toHaveBeenCalledWith(
      'zero-shot-image-classification',
      'Xenova/siglip-base-patch16-224',
      expect.objectContaining({ progress_callback: expect.any(Function) })
    )
  })

  it('does not call pipeline() a second time if already loaded', async () => {
    const { pipeline } = await import('@huggingface/transformers')
    vi.mocked(pipeline).mockClear()
    await loadModel()
    await loadModel()
    expect(pipeline).toHaveBeenCalledTimes(1)
  })

  it('invokes onProgress callback when progress info is provided', async () => {
    const { pipeline } = await import('@huggingface/transformers')
    const onProgress = vi.fn()

    vi.mocked(pipeline).mockImplementationOnce(async (_task, _model, opts) => {
      const cb = (opts as { progress_callback?: (info: unknown) => void }).progress_callback
      cb?.({ status: 'downloading', progress: 42 })
      return mockPipelineFn
    })

    await loadModel(onProgress)
    expect(onProgress).toHaveBeenCalledWith(42)
  })
})

describe('classify', () => {
  beforeEach(() => {
    resetModel()
    mockPipelineFn.mockReset()
  })
  afterEach(() => resetModel())

  it('returns top-5 results with correct shape', async () => {
    mockPipelineFn.mockResolvedValue(
      makeMockResults([
        'a close-up portrait photograph of a person looking at the camera',
        'a photograph of a wedding ceremony at an altar or arch',
        'a candid photograph of a person laughing or smiling naturally',
        'a scenic landscape photograph of mountains, fields, or nature',
        'a close-up detail photograph of jewelry, rings, or accessories',
      ])
    )

    const results: ClassificationResult[] = await classify('data:image/jpeg;base64,...', 'photo-1')

    expect(results).toHaveLength(5)
    results.forEach((r) => {
      expect(r).toMatchObject({
        photoId: 'photo-1',
        label: expect.any(String),
        score: expect.any(Number),
        category: expect.stringMatching(/^(portrait|landscape|event|detail|group|candid|architecture|food|product|action|other)$/),
      })
    })
  })

  it('assigns the correct category for known labels', async () => {
    mockPipelineFn.mockResolvedValue([
      { label: 'a close-up portrait photograph of a person looking at the camera', score: 0.9 },
      { label: 'a photograph of a wedding ceremony at an altar or arch', score: 0.8 },
      { label: 'a photograph of a small group of people posing together', score: 0.7 },
      { label: 'a close-up detail photograph of jewelry, rings, or accessories', score: 0.6 },
      { label: 'a candid photograph of a person laughing or smiling naturally', score: 0.5 },
    ])

    const results = await classify('data:image/jpeg;base64,...', 'photo-2')

    expect(results[0].category).toBe('portrait')
    expect(results[1].category).toBe('event')
    expect(results[2].category).toBe('group')
    expect(results[3].category).toBe('detail')
    expect(results[4].category).toBe('candid')
  })

  it('uses "other" category for unknown labels', async () => {
    mockPipelineFn.mockResolvedValue([{ label: 'unknown futuristic label', score: 0.99 }])

    const results = await classify('data:image/jpeg;base64,...', 'photo-3', 1)
    expect(results[0].category).toBe('other')
  })

  it('respects custom topK parameter', async () => {
    mockPipelineFn.mockResolvedValue(makeMockResults(['wedding ceremony', 'first dance', 'cake cutting']))

    await classify('data:image/jpeg;base64,...', 'photo-4', 3)

    expect(mockPipelineFn).toHaveBeenCalledWith(
      'data:image/jpeg;base64,...',
      expect.any(Array),
      expect.objectContaining({ topk: 3 })
    )
  })

  it('loads model automatically if not yet loaded', async () => {
    const { pipeline } = await import('@huggingface/transformers')
    vi.mocked(pipeline).mockClear()
    mockPipelineFn.mockResolvedValue([{ label: 'wedding ceremony', score: 0.9 }])

    await classify('data:image/jpeg;base64,...', 'photo-5', 1)
    expect(pipeline).toHaveBeenCalledTimes(1)
  })

  it('uses custom labels when provided', async () => {
    const customLabels = ['a photograph of a kitchen interior', 'a photograph of a bedroom']
    mockPipelineFn.mockResolvedValue([
      { label: 'a photograph of a kitchen interior', score: 0.85 },
    ])

    await classify('data:image/jpeg;base64,...', 'photo-6', 1, customLabels)

    expect(mockPipelineFn).toHaveBeenCalledWith(
      'data:image/jpeg;base64,...',
      customLabels,
      expect.objectContaining({ topk: 1 })
    )
  })
})
