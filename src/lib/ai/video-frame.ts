// ─── Video Frame Extraction ───────────────────────────────────────────────────
// Utilities to detect file types and extract a single canvas frame from a
// video file for AI classification.

const RAW_EXTENSIONS = new Set(['.raw', '.cr2', '.nef', '.arw', '.dng', '.heic', '.heif'])
const RAW_MIME_TYPES = new Set(['image/heic', 'image/heif', 'image/x-adobe-dng'])
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm'])
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

/** Returns true if the MIME type is a browser-playable video format. */
export function isVideoFile(mimeType: string): boolean {
  return VIDEO_MIME_TYPES.has(mimeType)
}

/**
 * Returns true if the file is a RAW or HEIC format that the browser's
 * HTMLImageElement cannot decode natively.
 */
export function isRawFile(filename: string, mimeType: string): boolean {
  if (RAW_MIME_TYPES.has(mimeType)) return true
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  return RAW_EXTENSIONS.has(ext)
}

/**
 * Returns true if the browser can decode the file via HTMLImageElement.
 * Rejects RAW/HEIC formats and files larger than 50 MB.
 */
export function isBrowserDecodable(file: File): boolean {
  if (file.size > MAX_FILE_SIZE_BYTES) return false
  if (isRawFile(file.name, file.type)) return false
  if (isVideoFile(file.type)) return false
  return true
}

/**
 * Extracts a single ImageData frame from a video file at 25% of its duration.
 * Uses an offscreen HTMLVideoElement + Canvas.
 * Rejects with a descriptive error on failure or after a 10-second timeout.
 */
export function extractVideoFrame(file: File): Promise<ImageData> {
  return new Promise<ImageData>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'metadata'

    let settled = false
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
      video.src = ''
      video.load()
    }

    const fail = (reason: string) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(reason))
    }

    const timeoutId = setTimeout(() => {
      fail('Video frame extraction timed out after 10 seconds')
    }, 10_000)

    video.addEventListener('error', () => {
      clearTimeout(timeoutId)
      fail('Failed to load video: unsupported format or corrupt file')
    })

    video.addEventListener('loadedmetadata', () => {
      if (video.duration === 0 || !isFinite(video.duration)) {
        clearTimeout(timeoutId)
        fail('Video has zero or invalid duration')
        return
      }
      video.currentTime = video.duration * 0.25
    })

    video.addEventListener('seeked', () => {
      clearTimeout(timeoutId)
      if (settled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 224
        canvas.height = video.videoHeight || 224
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          fail('Could not get 2D canvas context')
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        settled = true
        cleanup()
        resolve(imageData)
      } catch (err) {
        fail(err instanceof Error ? err.message : 'Canvas draw failed')
      }
    })

    video.src = objectUrl
    video.load()
  })
}
