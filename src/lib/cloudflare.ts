/**
 * Image serving layer — uses Supabase Storage directly.
 *
 * This replaces the Cloudflare Images integration with free Supabase Storage
 * public URLs. When ready to scale, swap back to Cloudflare Images for CDN
 * transforms, thumbnails, and watermarking.
 *
 * The public API surface is unchanged so all existing imports keep working.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const STORAGE_BUCKET = 'photos'

/* ------------------------------------------------------------------ */
/*  URL builders                                                       */
/* ------------------------------------------------------------------ */

/**
 * Get the public URL for an image stored in Supabase Storage.
 * The `imageId` is the storage_path within the bucket.
 * The `variant` param is accepted for API compat but ignored (no transforms).
 */
export function getImageUrl(imageId: string, _variant = 'public'): string {
  if (!imageId || !SUPABASE_URL) return ''
  // If it's already a full URL, return as-is
  if (imageId.startsWith('http')) return imageId
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imageId}`
}

export function getThumbnailUrl(imageId: string): string {
  // Supabase supports image transforms on Pro plan via /render/image
  // For free tier, serve the original
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

/**
 * Generate srcset — for now just returns the single URL at all widths.
 * Swap to Cloudflare or Supabase Pro transforms later.
 */
export function getSrcSet(imageId: string, widths: number[] = [400, 800, 1200, 1600]): string {
  const url = getImageUrl(imageId)
  if (!url) return ''
  return widths.map((w) => `${url} ${w}w`).join(', ')
}

/* ------------------------------------------------------------------ */
/*  Server-side "upload" (no-op — files already in Supabase Storage)   */
/* ------------------------------------------------------------------ */

interface UploadResult {
  imageId: string
  variants: string[]
}

/**
 * No-op for Supabase Storage — the file is already stored.
 * Returns the storage path as the imageId so URL builders work.
 */
export async function uploadFromUrl(
  sourceUrl: string,
  metadata?: Record<string, string>,
): Promise<UploadResult> {
  // Extract the storage path from the signed URL if possible
  const imageId = metadata?.mediaId ?? sourceUrl
  return {
    imageId,
    variants: ['public'],
  }
}

export async function uploadFromBuffer(
  _buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  _metadata?: Record<string, string>,
): Promise<UploadResult> {
  return {
    imageId: fileName,
    variants: ['public'],
  }
}

/**
 * No-op for Supabase Storage — deletion is handled via Supabase client.
 */
export async function deleteImage(_imageId: string): Promise<void> {
  // When using Supabase Storage, delete via:
  // supabase.storage.from('photos').remove([storagePath])
}
