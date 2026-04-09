import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isVideoFile,
  isRawFile,
  isBrowserDecodable,
  extractVideoFrame,
} from '../video-frame'

// ─── isVideoFile ──────────────────────────────────────────────────────────────

describe('isVideoFile', () => {
  it('returns true for video/mp4', () => {
    expect(isVideoFile('video/mp4')).toBe(true)
  })

  it('returns true for video/quicktime', () => {
    expect(isVideoFile('video/quicktime')).toBe(true)
  })

  it('returns true for video/webm', () => {
    expect(isVideoFile('video/webm')).toBe(true)
  })

  it('returns false for image/jpeg', () => {
    expect(isVideoFile('image/jpeg')).toBe(false)
  })

  it('returns false for image/png', () => {
    expect(isVideoFile('image/png')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isVideoFile('')).toBe(false)
  })
})

// ─── isRawFile ────────────────────────────────────────────────────────────────

describe('isRawFile', () => {
  it.each(['.raw', '.cr2', '.nef', '.arw', '.dng', '.heic', '.heif'])(
    'returns true for %s extension',
    (ext) => {
      expect(isRawFile(`photo${ext}`, 'application/octet-stream')).toBe(true)
    },
  )

  it('returns true for image/heic mime type', () => {
    expect(isRawFile('photo.heic', 'image/heic')).toBe(true)
  })

  it('returns false for jpeg', () => {
    expect(isRawFile('photo.jpg', 'image/jpeg')).toBe(false)
  })

  it('returns false for png', () => {
    expect(isRawFile('photo.png', 'image/png')).toBe(false)
  })

  it('returns false for webp', () => {
    expect(isRawFile('photo.webp', 'image/webp')).toBe(false)
  })

  it('is case-insensitive for extensions', () => {
    expect(isRawFile('photo.CR2', 'application/octet-stream')).toBe(true)
    expect(isRawFile('photo.NEF', 'application/octet-stream')).toBe(true)
  })
})

// ─── isBrowserDecodable ───────────────────────────────────────────────────────

describe('isBrowserDecodable', () => {
  function makeFile(name: string, type: string, sizeMB = 1): File {
    return new File([new ArrayBuffer(sizeMB * 1024 * 1024)], name, { type })
  }

  it('returns true for jpeg', () => {
    expect(isBrowserDecodable(makeFile('photo.jpg', 'image/jpeg'))).toBe(true)
  })

  it('returns true for png', () => {
    expect(isBrowserDecodable(makeFile('photo.png', 'image/png'))).toBe(true)
  })

  it('returns true for webp', () => {
    expect(isBrowserDecodable(makeFile('photo.webp', 'image/webp'))).toBe(true)
  })

  it('returns true for tiff', () => {
    expect(isBrowserDecodable(makeFile('photo.tiff', 'image/tiff'))).toBe(true)
  })

  it('returns false for RAW (.cr2)', () => {
    expect(isBrowserDecodable(makeFile('photo.cr2', 'application/octet-stream'))).toBe(false)
  })

  it('returns false for .heic', () => {
    expect(isBrowserDecodable(makeFile('photo.heic', 'image/heic'))).toBe(false)
  })

  it('returns false for files > 50MB', () => {
    expect(isBrowserDecodable(makeFile('photo.jpg', 'image/jpeg', 51))).toBe(false)
  })

  it('returns true for files exactly 50MB', () => {
    expect(isBrowserDecodable(makeFile('photo.jpg', 'image/jpeg', 50))).toBe(true)
  })
})

// ─── extractVideoFrame ────────────────────────────────────────────────────────

describe('extractVideoFrame', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>
  let originalCreateElement: typeof document.createElement

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => 'blob:mock-url')
    revokeObjectURLSpy = vi.fn()
    Object.defineProperty(globalThis, 'URL', {
      value: { createObjectURL: createObjectURLSpy, revokeObjectURL: revokeObjectURLSpy },
      writable: true,
      configurable: true,
    })
    originalCreateElement = document.createElement.bind(document)
  })

  afterEach(() => {
    document.createElement = originalCreateElement
    vi.restoreAllMocks()
  })

  function makeFakeVideoElement(opts: { duration?: number; triggerEvent?: 'error' | 'loadedmetadata' | 'seeked' }) {
    const listeners: Record<string, Array<() => void>> = {}
    const el = {
      muted: false,
      preload: '',
      currentTime: 0,
      videoWidth: 320,
      videoHeight: 240,
      duration: opts.duration ?? NaN,
      src: '',
      load() {
        // Simulate async event firing
        if (opts.triggerEvent) {
          setTimeout(() => {
            const handlers = listeners[opts.triggerEvent!] ?? []
            handlers.forEach((h) => h())
          }, 0)
        }
      },
      addEventListener(event: string, handler: () => void) {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(handler)
      },
    }
    return el
  }

  it('rejects when video fires error event', async () => {
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'video') return makeFakeVideoElement({ triggerEvent: 'error' }) as unknown as HTMLElement
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const file = new File([new ArrayBuffer(100)], 'test.mp4', { type: 'video/mp4' })
    await expect(extractVideoFrame(file)).rejects.toThrow(/unsupported format|corrupt/)
  })

  it('rejects when video has zero duration', async () => {
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'video') return makeFakeVideoElement({ duration: 0, triggerEvent: 'loadedmetadata' }) as unknown as HTMLElement
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const file = new File([new ArrayBuffer(100)], 'test.mp4', { type: 'video/mp4' })
    await expect(extractVideoFrame(file)).rejects.toThrow(/zero|invalid duration/)
  })

  it('revokes the object URL even on failure', async () => {
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'video') return makeFakeVideoElement({ triggerEvent: 'error' }) as unknown as HTMLElement
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const file = new File([new ArrayBuffer(100)], 'test.mp4', { type: 'video/mp4' })
    try {
      await extractVideoFrame(file)
    } catch {
      // expected
    }
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })
})
