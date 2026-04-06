/**
 * Cloudflare Images integration.
 *
 * When CLOUDFLARE_API_TOKEN + NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID are set,
 * images are uploaded to Cloudflare Images and served via imagedelivery.net
 * with CDN transforms (thumbnails, watermarks, OG variants).
 *
 * When those vars are absent the module falls back to Supabase Storage public
 * URLs so the app works identically in local dev / environments that haven't
 * wired Cloudflare yet.
 */

const CF_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID ?? ''
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? ''
const CF_ENABLED = Boolean(CF_ACCOUNT_ID && CF_API_TOKEN)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const STORAGE_BUCKET = 'photos'

/* ------------------------------------------------------------------ */
/*  URL builders                                                        */
/* ------------------------------------------------------------------ */

/**
 * Return the public URL for an image.
 * If `imageId` starts with "cf:" it's a Cloudflare image ID — serve via CDN.
 * Otherwise treat it as a Supabase Storage path.
 */
export function getImageUrl(imageId: string, variant = 'public'): string {
  if (!imageId) return ''
  if (imageId.startsWith('http')) return imageId

  if (imageId.startsWith('cf:')) {
    const cfId = imageId.slice(3)
    return `https://imagedelivery.net/${CF_ACCOUNT_ID}/${cfId}/${variant}`
  }

  // Supabase Storage fallback
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imageId}`
}

export function getThumbnailUrl(imageId: string): string {
  return getImageUrl(imageId, 'thumbnail')
}

export function getWatermarkUrl(imageId: string): string {
  return getImageUrl(imageId, 'watermark')
}

export function getPreviewUrl(imageId: string): string {
  return getImageUrl(imageId, 'preview')
}

export function getOgUrl(imageId: string): string {
  return getImageUrl(imageId, 'og')
}

export function getSrcSet(imageId: string, widths: number[] = [400, 800, 1200, 1600]): string {
  if (!imageId) return ''
  if (imageId.startsWith('cf:')) {
    const cfId = imageId.slice(3)
    const variants: Record<number, string> = {
      400: 'thumbnail',
      800: 'preview',
      1200: 'public',
      1600: 'public',
    }
    return widths
      .map((w) => {
        const v = variants[w] ?? 'public'
        return `https://imagedelivery.net/${CF_ACCOUNT_ID}/${cfId}/${v} ${w}w`
      })
      .join(', ')
  }
  // Supabase fallback — single URL at all widths
  const url = getImageUrl(imageId)
  return widths.map((w) => `${url} ${w}w`).join(', ')
}

/* ------------------------------------------------------------------ */
/*  Server-side upload                                                  */
/* ------------------------------------------------------------------ */

interface UploadResult {
  /** Opaque image identifier. Prefixed "cf:" for Cloudflare, plain path for Supabase. */
  imageId: string
  /** All available variant names (or 'public' for Supabase). */
  variants: string[]
  /** Whether the upload went to Cloudflare or used the Supabase fallback. */
  provider: 'cloudflare' | 'supabase'
}

interface CloudflareUploadResponse {
  result: {
    id: string
    variants: string[]
    filename: string
    uploaded: string
  }
  success: boolean
  errors: Array<{ code: number; message: string }>
  messages: string[]
}

/**
 * Upload an image to Cloudflare Images from a public source URL.
 * Falls back to a no-op Supabase result when CF is not configured.
 */
export async function uploadFromUrl(
  sourceUrl: string,
  metadata?: Record<string, string>,
): Promise<UploadResult> {
  if (!CF_ENABLED) {
    return {
      imageId: metadata?.storagePath ?? sourceUrl,
      variants: ['public'],
      provider: 'supabase',
    }
  }

  const form = new FormData()
  form.append('url', sourceUrl)
  if (metadata) {
    form.append('metadata', JSON.stringify(metadata))
  }
  form.append('requireSignedURLs', 'false')

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      body: form,
    },
  )

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Cloudflare Images upload failed (${resp.status}): ${text}`)
  }

  const data = (await resp.json()) as CloudflareUploadResponse
  if (!data.success) {
    throw new Error(`Cloudflare Images error: ${data.errors.map((e) => e.message).join(', ')}`)
  }

  return {
    imageId: `cf:${data.result.id}`,
    variants: data.result.variants,
    provider: 'cloudflare',
  }
}

/**
 * Upload an image to Cloudflare Images from a raw buffer.
 * Falls back to a no-op Supabase result when CF is not configured.
 */
export async function uploadFromBuffer(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  metadata?: Record<string, string>,
): Promise<UploadResult> {
  if (!CF_ENABLED) {
    return {
      imageId: metadata?.storagePath ?? fileName,
      variants: ['public'],
      provider: 'supabase',
    }
  }

  const blob = new Blob([buffer instanceof Uint8Array ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer : buffer], { type: 'image/jpeg' })
  const form = new FormData()
  form.append('file', blob, fileName)
  if (metadata) {
    form.append('metadata', JSON.stringify(metadata))
  }
  form.append('requireSignedURLs', 'false')

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      body: form,
    },
  )

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Cloudflare Images upload failed (${resp.status}): ${text}`)
  }

  const data = (await resp.json()) as CloudflareUploadResponse
  if (!data.success) {
    throw new Error(`Cloudflare Images error: ${data.errors.map((e) => e.message).join(', ')}`)
  }

  return {
    imageId: `cf:${data.result.id}`,
    variants: data.result.variants,
    provider: 'cloudflare',
  }
}

/**
 * Delete an image from Cloudflare Images.
 * Strips the "cf:" prefix before calling the API.
 */
export async function deleteImage(imageId: string): Promise<void> {
  if (!CF_ENABLED || !imageId.startsWith('cf:')) return

  const cfId = imageId.slice(3)
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${cfId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    },
  )
}

/** Returns true when the Cloudflare integration is active. Useful for diagnostics. */
export function isCloudflareEnabled(): boolean {
  return CF_ENABLED
}
