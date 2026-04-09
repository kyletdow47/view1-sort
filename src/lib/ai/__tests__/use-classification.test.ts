import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ─── Mock ClassificationPipeline ─────────────────────────────────────────────
const { MockPipeline } = vi.hoisted(() => {
  const MockPipeline = vi.fn().mockImplementation(() => ({
    enqueue: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    getQueueLength: vi.fn(() => 0),
    isProcessing: vi.fn(() => false),
    onResult: null as ((id: string, r: unknown) => void) | null,
    onError: null as ((id: string, e: string) => void) | null,
  }))
  return { MockPipeline }
})

vi.mock('../classification-pipeline', () => ({
  ClassificationPipeline: MockPipeline,
}))

// ─── Mock mediaStore ──────────────────────────────────────────────────────────
const mockSetPending = vi.fn()
const mockSetClassifying = vi.fn()
const mockSetClassified = vi.fn()
const mockSetFailed = vi.fn()
const mockGetProgress = vi.fn(() => ({ total: 0, classified: 0, pending: 0, failed: 0 }))
const mockRetryFailed = vi.fn(() => [])
const mockEditMedia = vi.fn().mockResolvedValue(undefined)

vi.mock('@/stores/mediaStore', () => ({
  useMediaStore: {
    getState: () => ({
      setClassificationPending: mockSetPending,
      setClassifying: mockSetClassifying,
      setClassified: mockSetClassified,
      setClassificationFailed: mockSetFailed,
      getClassificationProgress: mockGetProgress,
      retryFailedClassifications: mockRetryFailed,
      editMedia: mockEditMedia,
    }),
  },
}))

import { useClassification } from '../use-classification'

function makeFile(name = 'photo.jpg', type = 'image/jpeg'): File {
  return new File([new ArrayBuffer(100)], name, { type })
}

// ─── Hook lifecycle ───────────────────────────────────────────────────────────

describe('useClassification', () => {
  let pipelineInstance: ReturnType<typeof MockPipeline>

  beforeEach(() => {
    MockPipeline.mockClear()
    mockSetPending.mockClear()
    mockSetClassifying.mockClear()
    mockSetClassified.mockClear()
    mockSetFailed.mockClear()
    mockEditMedia.mockClear()
    mockGetProgress.mockReturnValue({ total: 0, classified: 0, pending: 0, failed: 0 })
    mockRetryFailed.mockReturnValue([])
  })

  it('creates a pipeline on mount', () => {
    renderHook(() => useClassification('real_estate'))
    expect(MockPipeline).toHaveBeenCalledWith('real_estate')
    pipelineInstance = MockPipeline.mock.results[0].value
    expect(pipelineInstance.start).toHaveBeenCalled()
  })

  it('stops the pipeline on unmount', () => {
    const { unmount } = renderHook(() => useClassification('wedding'))
    pipelineInstance = MockPipeline.mock.results[0].value
    unmount()
    expect(pipelineInstance.stop).toHaveBeenCalled()
  })

  it('classifyFile enqueues the item and sets pending', () => {
    const { result } = renderHook(() => useClassification('general'))
    pipelineInstance = MockPipeline.mock.results[0].value

    act(() => {
      result.current.classifyFile('m1', makeFile())
    })

    expect(mockSetPending).toHaveBeenCalledWith('m1')
    expect(pipelineInstance.enqueue).toHaveBeenCalledWith('m1', expect.any(File))
  })

  it('classifyBatch enqueues multiple items', () => {
    const { result } = renderHook(() => useClassification('travel'))
    pipelineInstance = MockPipeline.mock.results[0].value

    act(() => {
      result.current.classifyBatch([
        { mediaId: 'm1', file: makeFile() },
        { mediaId: 'm2', file: makeFile() },
        { mediaId: 'm3', file: makeFile() },
      ])
    })

    expect(mockSetPending).toHaveBeenCalledTimes(3)
    expect(pipelineInstance.enqueue).toHaveBeenCalledTimes(3)
  })

  it('onResult callback calls setClassified and editMedia', () => {
    renderHook(() => useClassification('real_estate'))
    pipelineInstance = MockPipeline.mock.results[0].value

    const result = { category: 'kitchen', confidence: 0.9, predictions: [], allScores: {} }

    act(() => {
      pipelineInstance.onResult('m1', result)
    })

    expect(mockSetClassified).toHaveBeenCalledWith('m1', result)
    expect(mockEditMedia).toHaveBeenCalledWith('m1', expect.objectContaining({
      ai_category: 'kitchen',
      ai_confidence: 0.9,
    }))
  })

  it('onError callback calls setClassificationFailed', () => {
    renderHook(() => useClassification('general'))
    pipelineInstance = MockPipeline.mock.results[0].value

    act(() => {
      pipelineInstance.onError('m1', 'WebGL unavailable')
    })

    expect(mockSetFailed).toHaveBeenCalledWith('m1', 'WebGL unavailable')
  })

  it('retryFailed re-enqueues failed items', () => {
    const { result } = renderHook(() => useClassification('travel'))
    pipelineInstance = MockPipeline.mock.results[0].value

    mockRetryFailed.mockReturnValue(['m2', 'm3'])

    act(() => {
      result.current.retryFailed()
    })

    expect(mockRetryFailed).toHaveBeenCalled()
  })

  it('progress reflects store state', () => {
    mockGetProgress.mockReturnValue({ total: 10, classified: 7, pending: 2, failed: 1 })
    const { result } = renderHook(() => useClassification('wedding'))

    expect(result.current.progress.total).toBe(10)
    expect(result.current.progress.classified).toBe(7)
  })
})
