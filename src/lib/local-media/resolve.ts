/**
 * resolveMediaSrc — pick the right URL for a media row.
 *
 * Media with `storage_path` starting with `local:` live only in the user's
 * IndexedDB (see ./index.ts). Everything else uses the standard
 * thumbnail_url / cloudflare path. This helper hides the lookup so PhotoCard,
 * gallery-builder, etc. don't have to care where a photo physically lives.
 */

import type { Media } from '@/types/supabase'
import {
  getCachedBlobUrl,
  parseLocalStoragePath,
  resolveLocalBlobUrl,
} from './index'

export type ResolveSource = Pick<
  Media,
  'project_id' | 'storage_path' | 'thumbnail_url'
>

/**
 * Synchronous best-effort: returns a usable URL if one is already known
 * (remote URLs, or a local blob that's been resolved once this session).
 * Returns `null` if the media is local and not yet cached — the caller
 * should fall back to `resolveMediaSrcAsync`.
 */
export function resolveMediaSrc(media: ResolveSource): string | null {
  const localHash = parseLocalStoragePath(media.storage_path)
  if (localHash) return getCachedBlobUrl(media.project_id, localHash)
  return media.thumbnail_url ?? null
}

/**
 * Async form: guaranteed to return a URL for local media by reading the
 * blob from IndexedDB on first call. Returns `null` only if the record is
 * missing (e.g., viewing on a different device).
 */
export async function resolveMediaSrcAsync(
  media: ResolveSource,
): Promise<string | null> {
  const localHash = parseLocalStoragePath(media.storage_path)
  if (localHash) return resolveLocalBlobUrl(media.project_id, localHash)
  return media.thumbnail_url ?? null
}

export function isLocalMedia(media: Pick<Media, 'storage_path'>): boolean {
  return parseLocalStoragePath(media.storage_path) !== null
}
