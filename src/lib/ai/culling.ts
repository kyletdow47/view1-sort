/**
 * Browser-side smart culling analysis.
 * Uses canvas to compute image quality metrics without any server round-trips.
 */

export interface CullFlag {
  type: 'blurry' | 'duplicate' | 'overexposed' | 'underexposed'
  confidence: number // 0–1
  details: string
}

export interface CullResult {
  fileId: string
  flags: CullFlag[]
  keep: boolean // user-togglable; default true unless flagged
  preview?: string // objectURL
}

/* ── Load image into canvas ───────────────────────────────────────────── */

function loadImageToCanvas(
  src: string,
  w: number,
  h: number
): Promise<{ ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve({ ctx, canvas })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/* ── Laplacian variance (blur detection) ──────────────────────────────── */
// Low variance → blurry. Threshold ~100 for 100×100 grayscale.

function laplacianVariance(data: Uint8ClampedArray, width: number, height: number): number {
  let sum = 0
  let sumSq = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3

      const top    = ((y - 1) * width + x) * 4
      const bottom = ((y + 1) * width + x) * 4
      const left   = (y * width + (x - 1)) * 4
      const right  = (y * width + (x + 1)) * 4

      const gTop    = (data[top]    + data[top + 1]    + data[top + 2])    / 3
      const gBottom = (data[bottom] + data[bottom + 1] + data[bottom + 2]) / 3
      const gLeft   = (data[left]   + data[left + 1]   + data[left + 2])   / 3
      const gRight  = (data[right]  + data[right + 1]  + data[right + 2])  / 3

      const lap = Math.abs(4 * gray - gTop - gBottom - gLeft - gRight)
      sum += lap
      sumSq += lap * lap
      count++
    }
  }

  const mean = sum / count
  return sumSq / count - mean * mean
}

/* ── Average brightness (exposure check) ─────────────────────────────── */

function averageBrightness(data: Uint8ClampedArray): number {
  let total = 0
  const pixels = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    total += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
  }
  return total / pixels
}

/* ── 8×8 perceptual hash ──────────────────────────────────────────────── */

export function computeHash(data: Uint8ClampedArray, w: number, h: number): string {
  const cellW = w / 8
  const cellH = h / 8
  const cells: number[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let sum = 0
      let count = 0
      for (let y = Math.floor(row * cellH); y < Math.floor((row + 1) * cellH); y++) {
        for (let x = Math.floor(col * cellW); x < Math.floor((col + 1) * cellW); x++) {
          const idx = (y * w + x) * 4
          sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          count++
        }
      }
      cells.push(count > 0 ? sum / count : 0)
    }
  }

  const avg = cells.reduce((a, b) => a + b, 0) / cells.length
  return cells.map((v) => (v >= avg ? '1' : '0')).join('')
}

function hammingDistance(a: string, b: string): number {
  let dist = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) dist++
  }
  return dist
}

/* ── Main analysis function ───────────────────────────────────────────── */

export async function analyzeFile(
  file: File,
  fileId: string,
  existingHashes: Map<string, string>
): Promise<{ result: CullResult; hash: string }> {
  const url = URL.createObjectURL(file)
  const flags: CullFlag[] = []

  try {
    // Load at 100×100 for fast analysis
    const { ctx } = await loadImageToCanvas(url, 100, 100)
    const imageData = ctx.getImageData(0, 0, 100, 100)
    const pixels = imageData.data

    // Blur
    const blur = laplacianVariance(pixels, 100, 100)
    if (blur < 80) {
      flags.push({
        type: 'blurry',
        confidence: Math.max(0, Math.min(1, 1 - blur / 80)),
        details: `Sharpness score: ${blur.toFixed(0)} (threshold 80)`,
      })
    }

    // Exposure
    const brightness = averageBrightness(pixels)
    if (brightness < 30) {
      flags.push({
        type: 'underexposed',
        confidence: Math.min(1, (30 - brightness) / 30),
        details: `Average brightness: ${brightness.toFixed(0)}/255`,
      })
    } else if (brightness > 230) {
      flags.push({
        type: 'overexposed',
        confidence: Math.min(1, (brightness - 230) / 25),
        details: `Average brightness: ${brightness.toFixed(0)}/255`,
      })
    }

    // Duplicate check (hamming distance ≤ 8 on 64-bit hash = >87% similar)
    const hash = computeHash(pixels, 100, 100)
    for (const [otherId, otherHash] of existingHashes) {
      const dist = hammingDistance(hash, otherHash)
      if (dist <= 8 && otherId !== fileId) {
        flags.push({
          type: 'duplicate',
          confidence: Math.min(1, (8 - dist) / 8 + 0.5),
          details: `Near-duplicate of another photo (similarity ${Math.round((1 - dist / 64) * 100)}%)`,
        })
        break
      }
    }

    return {
      result: {
        fileId,
        flags,
        keep: true,
        preview: url,
      },
      hash,
    }
  } catch {
    URL.revokeObjectURL(url)
    return {
      result: { fileId, flags: [], keep: true, preview: url },
      hash: '',
    }
  }
}
