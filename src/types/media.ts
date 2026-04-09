export type MediaOrientation = 'landscape' | 'portrait' | 'square'

export interface MediaItem {
  id: string
  thumbnail_url?: string | null
  cloudflare_image_id?: string | null
  filename: string
  ai_category?: string | null
  ai_confidence?: number | null
  orientation?: MediaOrientation | null
  selected?: boolean
  // Culling flags set by canvas-based analysis during upload
  is_blurry?: boolean | null
  is_duplicate?: boolean | null
  is_overexposed?: boolean | null
  is_underexposed?: boolean | null
  culling_confidence?: number | null
  // User review flags
  is_starred?: boolean | null
  review_flag?: 'keep' | 'reject' | null
}
