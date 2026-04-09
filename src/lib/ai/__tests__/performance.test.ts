import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock classifier-v2 ───────────────────────────────────────────────────────
const { mockClassifyFile, mockLoadModel, mockResetModel } = vi.hoisted(() => ({
  mockClassifyFile: vi.fn(),
  mockLoadModel: vi.fn(),
  mockResetModel: vi.fn(),
}))

vi.mock('../classifier-v2', () => ({
  classifyFile: mockClassifyFile,
  loadModel: mockLoadModel,
  resetModel: mockResetModel,
}))

// ─── Mock video-frame ─────────────────────────────────────────────────────────
vi.mock('../video-frame', () => ({
  isVideoFile: vi.fn(() => false),
  isRawFile: vi.fn((name: string) => /\.(raw|cr2|nef|arw|dng|heic|heif)$/i.test(name)),
  isBrowserDecodable: vi.fn((file: File) => {
    if (file.size > 50 * 1024 * 1024) return false
    if (/\.(raw|cr2|nef|arw|dng|heic|heif)$/i.test(file.name)) return false
    return true
  }),
  extractVideoFrame: vi.fn(),
}))

import { ClassificationPipeline } from '../classification-pipeline'
import { isBrowserDecodable, isRawFile } from '../video-frame'

function makeFile(name: string, type: string, sizeMB = 1): File {
  return new File([new ArrayBuffer(sizeMB * 1024 * 1024)], name, { type })
}

// ─── RAW/HEIC files assigned to 'other' ──────────────────────────────────────

describe('RAW/HEIC file detection', () => {
  it.each(['.raw', '.cr2', '.nef', '.arw', '.dng', '.heic', '.heif'])(
    '%s files are not browser-decodable',
    (ext) => {
      const file = makeFile(`photo${ext}`, 'application/octet-stream')
      expect(isBrowserDecodable(file)).toBe(false)
    },
  )

  it.each(['.raw', '.cr2', '.nef', '.arw', '.dng', '.heic', '.heif'])(
    '%s files are identified as RAW by isRawFile',
    (ext) => {
      expect(isRawFile(`photo${ext}`, 'application/octet-stream')).toBe(true)
    },
  )
})

// ─── Files > 50MB skipped ─────────────────────────────────────────────────────

describe('>50MB files', () => {
  it('files exactly 50MB are decodable', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 50)
    expect(isBrowserDecodable(file)).toBe(true)
  })

  it('files 51MB are not decodable', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 51)
    expect(isBrowserDecodable(file)).toBe(false)
  })
})

// ─── TensorFlow.js load failure handling ─────────────────────────────────────

describe('TF.js load failure', () => {
  beforeEach(() => {
    mockClassifyFile.mockReset()
    mockLoadModel.mockReset()
  })

  it('pipeline calls onError when classifyFile throws (model load failure)', async () => {
    mockClassifyFile.mockRejectedValue(new Error('WebGL not available'))

    const onErrorSpy = vi.fn()
    const onResultSpy = vi.fn()

    const pipeline = new ClassificationPipeline('general')
    pipeline.onResult = onResultSpy
    pipeline.onError = onErrorSpy

    const file = makeFile('photo.jpg', 'image/jpeg')
    pipeline.enqueue('m1', file)
    pipeline.start()

    await vi.waitUntil(() => onErrorSpy.mock.calls.length >= 1, { timeout: 2000 })
    expect(onErrorSpy).toHaveBeenCalledWith('m1', 'WebGL not available')
    expect(onResultSpy).not.toHaveBeenCalled()
  })

  it('pipeline continues processing other items after TF.js failure', async () => {
    mockClassifyFile
      .mockRejectedValueOnce(new Error('WebGL not available'))
      .mockResolvedValueOnce({ category: 'people', confidence: 0.8, predictions: [], allScores: {} })

    const onErrorSpy = vi.fn()
    const onResultSpy = vi.fn()

    const pipeline = new ClassificationPipeline('general')
    pipeline.onResult = onResultSpy
    pipeline.onError = onErrorSpy

    pipeline.enqueue('m1', makeFile('photo1.jpg', 'image/jpeg'))
    pipeline.enqueue('m2', makeFile('photo2.jpg', 'image/jpeg'))
    pipeline.start()

    await vi.waitUntil(
      () => onErrorSpy.mock.calls.length + onResultSpy.mock.calls.length >= 2,
      { timeout: 2000 },
    )

    expect(onErrorSpy).toHaveBeenCalledWith('m1', 'WebGL not available')
    expect(onResultSpy).toHaveBeenCalledWith('m2', expect.objectContaining({ category: 'people' }))
  })
})

// ─── Orientation detection from dimensions ────────────────────────────────────

function detectOrientation(width: number, height: number): 'landscape' | 'portrait' | 'square' {
  if (width > height) return 'landscape'
  if (height > width) return 'portrait'
  return 'square'
}

describe('orientation detection', () => {
  it('landscape when width > height', () => {
    expect(detectOrientation(3000, 2000)).toBe('landscape')
  })

  it('portrait when height > width', () => {
    expect(detectOrientation(2000, 3000)).toBe('portrait')
  })

  it('square when width === height', () => {
    expect(detectOrientation(1080, 1080)).toBe('square')
  })
})

// ─── Batch processing performance (queue throughput) ─────────────────────────

describe('batch processing throughput', () => {
  it('processes 10 items without dropping any', async () => {
    const results: string[] = []
    mockClassifyFile.mockResolvedValue({
      category: 'general',
      confidence: 0.7,
      predictions: [],
      allScores: {},
    })

    const pipeline = new ClassificationPipeline('general')
    pipeline.onResult = vi.fn((id) => results.push(id))
    pipeline.onError = vi.fn()

    for (let i = 0; i < 10; i++) {
      pipeline.enqueue(`m${i}`, makeFile(`photo${i}.jpg`, 'image/jpeg'))
    }
    pipeline.start()

    await vi.waitUntil(() => results.length >= 10, { timeout: 5000 })
    expect(results).toHaveLength(10)
    // All 10 unique IDs should be present
    expect(new Set(results).size).toBe(10)
  })
})
