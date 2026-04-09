import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// ─── Mock @tensorflow-models/mobilenet ───────────────────────────────────────
const { mockClassifyFn, mockLoadFn } = vi.hoisted(() => ({
  mockClassifyFn: vi.fn(),
  mockLoadFn: vi.fn(),
}))

vi.mock('@tensorflow-models/mobilenet', () => ({
  load: mockLoadFn,
}))

vi.mock('@tensorflow/tfjs', () => ({}))

// ─── Mock video-frame ─────────────────────────────────────────────────────────
vi.mock('../video-frame', () => ({
  isVideoFile: vi.fn((mime: string) => mime.startsWith('video/')),
  isRawFile: vi.fn((name: string) => /\.(raw|cr2|nef|arw|dng|heic|heif)$/i.test(name)),
  isBrowserDecodable: vi.fn((file: File) => {
    if (file.size > 50 * 1024 * 1024) return false
    if (/\.(raw|cr2|nef|arw|dng|heic|heif)$/i.test(file.name)) return false
    return true
  }),
  extractVideoFrame: vi.fn(),
}))

import { loadModel, classifyImage, classifyFile, resetModel } from '../classifier-v2'
import { extractVideoFrame, isBrowserDecodable } from '../video-frame'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fakeModel() {
  return { classify: mockClassifyFn }
}

function makeFile(name: string, type: string, sizeMB = 1): File {
  return new File([new ArrayBuffer(sizeMB * 1024 * 1024)], name, { type })
}

// ImageData may not be defined in jsdom — use a plain-object shim
function fakeImageData(w = 1, h = 1): ImageData {
  return {
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h,
    colorSpace: 'srgb',
  } as unknown as ImageData
}

// ─── Setup URL mock ───────────────────────────────────────────────────────────
beforeAll(() => {
  if (typeof URL.createObjectURL !== 'function') {
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })
  }
})

// ─── loadModel ────────────────────────────────────────────────────────────────

describe('loadModel', () => {
  beforeEach(() => {
    resetModel()
    mockLoadFn.mockReset()
    mockLoadFn.mockResolvedValue(fakeModel())
  })

  it('calls mobilenet.load() and returns the model', async () => {
    const model = await loadModel()
    expect(mockLoadFn).toHaveBeenCalledTimes(1)
    expect(model).toHaveProperty('classify')
  })

  it('returns the cached model on second call (mobilenet.load called only once)', async () => {
    await loadModel()
    await loadModel()
    expect(mockLoadFn).toHaveBeenCalledTimes(1)
  })
})

// ─── classifyImage ────────────────────────────────────────────────────────────

describe('classifyImage', () => {
  beforeEach(() => {
    resetModel()
    mockLoadFn.mockResolvedValue(fakeModel())
  })

  it('calls model.classify and returns a ClassificationResult', async () => {
    mockClassifyFn.mockResolvedValue([
      { className: 'refrigerator', probability: 0.7 },
      { className: 'microwave', probability: 0.2 },
    ])

    const result = await classifyImage(fakeImageData(), 'real_estate')

    expect(mockClassifyFn).toHaveBeenCalled()
    expect(result.category).toBe('kitchen')
    expect(result.confidence).toBeGreaterThan(0)
    expect(Array.isArray(result.predictions)).toBe(true)
    expect(typeof result.allScores).toBe('object')
  })

  it('falls back to "other" when predictions do not match any category', async () => {
    mockClassifyFn.mockResolvedValue([
      { className: 'totally_unknown_xyz', probability: 0.05 },
    ])

    const result = await classifyImage(fakeImageData(), 'real_estate')
    expect(result.category).toBe('other')
  })
})

// ─── classifyFile ─────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  beforeEach(() => {
    resetModel()
    mockClassifyFn.mockReset()
    mockLoadFn.mockReset()
    mockLoadFn.mockResolvedValue(fakeModel())
    vi.mocked(extractVideoFrame).mockReset()
    vi.mocked(isBrowserDecodable).mockReset()
  })

  it('skips RAW files and returns category "other" with skipReason "raw_format"', async () => {
    vi.mocked(isBrowserDecodable).mockReturnValue(false)

    const file = makeFile('photo.cr2', 'application/octet-stream')
    const result = await classifyFile(file, 'real_estate')

    expect(result.category).toBe('other')
    expect(result.confidence).toBe(0)
    expect((result as { skipped?: boolean }).skipped).toBe(true)
    expect((result as { skipReason?: string }).skipReason).toBe('raw_format')
    expect(mockClassifyFn).not.toHaveBeenCalled()
  })

  it('skips files > 50MB and returns category "other" with skipReason "file_too_large"', async () => {
    vi.mocked(isBrowserDecodable).mockReturnValue(false)

    const file = makeFile('photo.jpg', 'image/jpeg', 51)
    const result = await classifyFile(file, 'general')

    expect(result.category).toBe('other')
    expect((result as { skipReason?: string }).skipReason).toBe('file_too_large')
    expect(mockClassifyFn).not.toHaveBeenCalled()
  })

  it('routes video files through extractVideoFrame', async () => {
    // Video: isVideoFile('video/mp4') returns true (from mock) → goes to extractVideoFrame
    const frame = fakeImageData(224, 224)
    vi.mocked(extractVideoFrame).mockResolvedValue(frame)
    mockClassifyFn.mockResolvedValue([
      { className: 'church', probability: 0.8 },
    ])

    const file = makeFile('clip.mp4', 'video/mp4')
    await classifyFile(file, 'wedding')

    expect(extractVideoFrame).toHaveBeenCalledWith(file)
    expect(mockClassifyFn).toHaveBeenCalled()
  })

  it('handles model load failure gracefully', async () => {
    resetModel()
    mockLoadFn.mockRejectedValue(new Error('WebGL not available'))
    // Use a video file: goes through extractVideoFrame → classifyImage → loadModel (which throws)
    vi.mocked(extractVideoFrame).mockResolvedValue(fakeImageData())

    const file = makeFile('clip.mp4', 'video/mp4')
    await expect(classifyFile(file, 'general')).rejects.toThrow(/WebGL not available/)
  })
})
