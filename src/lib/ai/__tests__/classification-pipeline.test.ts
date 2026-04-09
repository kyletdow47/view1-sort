import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock classifier-v2 ───────────────────────────────────────────────────────
const { mockClassifyFile } = vi.hoisted(() => ({
  mockClassifyFile: vi.fn(),
}))

vi.mock('../classifier-v2', () => ({
  classifyFile: mockClassifyFile,
  resetModel: vi.fn(),
}))

import { ClassificationPipeline } from '../classification-pipeline'
import type { ClassificationResult } from '../classifier-v2'

function makeFile(name = 'photo.jpg', type = 'image/jpeg'): File {
  return new File([new ArrayBuffer(1024)], name, { type })
}

function makeResult(category = 'kitchen'): ClassificationResult {
  return { category, confidence: 0.8, predictions: [], allScores: {} }
}

// ─── pipeline construction ────────────────────────────────────────────────────

describe('ClassificationPipeline', () => {
  let onResultSpy: ReturnType<typeof vi.fn>
  let onErrorSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockClassifyFile.mockReset()
    onResultSpy = vi.fn()
    onErrorSpy = vi.fn()
  })

  it('is not processing before start', () => {
    const pipeline = new ClassificationPipeline('real_estate')
    expect(pipeline.isProcessing()).toBe(false)
    expect(pipeline.getQueueLength()).toBe(0)
  })

  it('enqueue before start adds items to the queue', () => {
    const pipeline = new ClassificationPipeline('real_estate')
    pipeline.onResult = onResultSpy
    pipeline.enqueue('m1', makeFile())
    expect(pipeline.getQueueLength()).toBe(1)
  })

  it('processes enqueued items and calls onResult', async () => {
    mockClassifyFile.mockResolvedValue(makeResult('kitchen'))

    const pipeline = new ClassificationPipeline('real_estate')
    pipeline.onResult = onResultSpy
    pipeline.onError = onErrorSpy

    pipeline.enqueue('m1', makeFile())
    pipeline.start()

    // Wait for processing to complete
    await vi.waitUntil(() => onResultSpy.mock.calls.length >= 1, { timeout: 2000 })

    expect(onResultSpy).toHaveBeenCalledWith('m1', makeResult('kitchen'))
    expect(onErrorSpy).not.toHaveBeenCalled()
  })

  it('calls onResult with other/skipped for RAW files', async () => {
    // classifyFile returns a skipped result for RAW files
    const skippedResult = { category: 'other', confidence: 0, predictions: [], allScores: {}, skipped: true, skipReason: 'raw_format' as const }
    mockClassifyFile.mockResolvedValue(skippedResult)

    const pipeline = new ClassificationPipeline('real_estate')
    pipeline.onResult = onResultSpy
    pipeline.enqueue('m1', makeFile('photo.cr2', 'application/octet-stream'))
    pipeline.start()

    await vi.waitUntil(() => onResultSpy.mock.calls.length >= 1, { timeout: 2000 })
    expect(onResultSpy).toHaveBeenCalledWith('m1', expect.objectContaining({ category: 'other' }))
  })

  it('calls onError and continues queue when one item fails', async () => {
    mockClassifyFile
      .mockRejectedValueOnce(new Error('Canvas error'))
      .mockResolvedValueOnce(makeResult('exterior'))

    const pipeline = new ClassificationPipeline('real_estate')
    pipeline.onResult = onResultSpy
    pipeline.onError = onErrorSpy

    pipeline.enqueue('m1', makeFile())
    pipeline.enqueue('m2', makeFile())
    pipeline.start()

    await vi.waitUntil(() => (onResultSpy.mock.calls.length + onErrorSpy.mock.calls.length) >= 2, { timeout: 2000 })

    expect(onErrorSpy).toHaveBeenCalledWith('m1', 'Canvas error')
    expect(onResultSpy).toHaveBeenCalledWith('m2', makeResult('exterior'))
  })

  it('getQueueLength returns 0 after processing completes', async () => {
    mockClassifyFile.mockResolvedValue(makeResult('kitchen'))

    const pipeline = new ClassificationPipeline('real_estate')
    pipeline.onResult = onResultSpy
    pipeline.enqueue('m1', makeFile())
    pipeline.start()

    await vi.waitUntil(() => onResultSpy.mock.calls.length >= 1, { timeout: 2000 })
    expect(pipeline.getQueueLength()).toBe(0)
  })

  it('stop() clears the pipeline state', async () => {
    const pipeline = new ClassificationPipeline('wedding')
    pipeline.onResult = onResultSpy
    pipeline.enqueue('m1', makeFile())
    pipeline.start()
    pipeline.stop()

    expect(pipeline.isProcessing()).toBe(false)
  })

  it('processes multiple items in order', async () => {
    const results: string[] = []
    mockClassifyFile
      .mockResolvedValueOnce(makeResult('ceremony'))
      .mockResolvedValueOnce(makeResult('reception'))
      .mockResolvedValueOnce(makeResult('portraits'))

    const pipeline = new ClassificationPipeline('wedding')
    pipeline.onResult = vi.fn((id) => results.push(id))

    pipeline.enqueue('m1', makeFile())
    pipeline.enqueue('m2', makeFile())
    pipeline.enqueue('m3', makeFile())
    pipeline.start()

    await vi.waitUntil(() => results.length >= 3, { timeout: 3000 })
    expect(results).toEqual(['m1', 'm2', 'm3'])
  })
})
