/**
 * Cloudflare Images integration — upload, transform, and serve photos.
 *
 * Variant naming convention (configured in Cloudflare dashboard):
 *   - public:    Full-size, no watermark (for paid/delivered access)
 *   - thumbnail: 400px wide, fit=cover
 *   - preview:   1200px wide, watermark overlay (for unpaid gallery)
 *   - og:        1200x630, fit=cover (for social share cards)
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

/* ------------------------------------------------------------------ */
/*  URL builders (client-safe — use NEXT_PUBLIC env var)               */
/* ------------------------------------------------------------------ */

export function getImageUrl(imageId: string, variant = 'public'): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    // Gracefully return empty string when env var not configured
    // (e.g. during local dev without Cloudflare)
    return ''
  }
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/${variant}`
}

export function getThumbnailUrl(imageId: string): string {
  return getImageUrl(imageId, 'thumbnail')
}

export function getPreviewUrl(imageId: string): string {
  return getImageUrl(imageId, 'preview')
}

export function getOgUrl(imageId: string): string {
  return getImageUrl(imageId, 'og')
}

/**
 * Generate responsive srcset for a Cloudflare image.
 * Uses flexible variants with width hints.
 */
export function getSrcSet(imageId: string, widths: number[] = [400, 800, 1200, 1600]): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID environment variable')
  }
  return widths
    .map((w) => `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/w=${w} ${w}w`)
    .join(', ')
}

/* ------------------------------------------------------------------ */
/*  Server-side upload (uses secret API token)                         */
/* ------------------------------------------------------------------ */

interface CloudflareUploadResult {
  imageId: string
  variants: string[]
}

/**
 * Upload an image to Cloudflare Images from a URL (e.g. signed Supabase Storage URL).
 * This runs server-side only.
 */
export async function uploadFromUrl(
  sourceUrl: string,
  metadata?: Record<string, string>,
): Promise<CloudflareUploadResult> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials (CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN)')
  }

  const form = new FormData()
  form.append('url', sourceUrl)
  if (metadata) {
    form.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: form,
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Cloudflare Images upload failed (${response.status}): ${body}`)
  }

  const json = (await response.json()) as {
    success: boolean
    result: { id: string; variants: string[] }
    errors: { message: string }[]
  }

  if (!json.success) {
    throw new Error(`Cloudflare Images API error: ${json.errors.map((e) => e.message).join(', ')}`)
  }

  return {
    imageId: json.result.id,
    variants: json.result.variants,
  }
}

/**
 * Upload raw image bytes to Cloudflare Images.
 * Used when we already have the file buffer (e.g. from Supabase Storage download).
 */
export async function uploadFromBuffer(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  metadata?: Record<string, string>,
): Promise<CloudflareUploadResult> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials (CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN)')
  }

  const blob = new Blob([buffer as unknown as BlobPart])
  const form = new FormData()
  form.append('file', blob, fileName)
  if (metadata) {
    form.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: form,
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Cloudflare Images upload failed (${response.status}): ${body}`)
  }

  const json = (await response.json()) as {
    success: boolean
    result: { id: string; variants: string[] }
    errors: { message: string }[]
  }

  if (!json.success) {
    throw new Error(`Cloudflare Images API error: ${json.errors.map((e) => e.message).join(', ')}`)
  }

  return {
    imageId: json.result.id,
    variants: json.result.variants,
  }
}

/**
 * Delete an image from Cloudflare Images.
 */
export async function deleteImage(imageId: string): Promise<void> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials')
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    },
  )

  if (!response.ok && response.status !== 404) {
    const body = await response.text()
    throw new Error(`Cloudflare Images delete failed (${response.status}): ${body}`)
  }
}
