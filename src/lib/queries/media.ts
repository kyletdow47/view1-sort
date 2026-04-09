import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, Media, MediaUpdate } from '@/types/supabase'

export async function getMedia(supabase: SupabaseClient, projectId: string): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch media: ${error.message}`)
  return data ?? []
}

export async function updateMedia(
  supabase: SupabaseClient,
  id: string,
  update: MediaUpdate,
): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`Failed to update media: ${error.message}`)
  return data
}

export async function deleteMedia(supabase: SupabaseClient, ids: string[]): Promise<void> {
  const { error } = await supabase.from('media').delete().in('id', ids)
  if (error) throw new Error(`Failed to delete media: ${error.message}`)
}

export interface AIResultUpdate {
  id: string
  ai_category: string
  ai_confidence: number
}

export interface CullingResultUpdate {
  id: string
  is_blurry?: boolean
  is_duplicate?: boolean
  is_overexposed?: boolean
  is_underexposed?: boolean
  culling_confidence?: number
}

/**
 * Batch-update AI classification results for multiple media items.
 * Uses individual updates (Supabase JS doesn't support bulk upsert with
 * per-row values without raw SQL).
 */
export async function updateMediaAIResults(
  supabase: SupabaseClient,
  updates: AIResultUpdate[],
): Promise<void> {
  const batchSize = 50
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    await Promise.all(
      batch.map(({ id, ai_category, ai_confidence }) =>
        supabase
          .from('media')
          .update({ ai_category, ai_confidence })
          .eq('id', id),
      ),
    )
  }
}

/**
 * Batch-update culling analysis flags for multiple media items.
 */
export async function updateMediaCullingResults(
  supabase: SupabaseClient,
  updates: CullingResultUpdate[],
): Promise<void> {
  const batchSize = 50
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    await Promise.all(
      batch.map(({ id, ...flags }) =>
        supabase.from('media').update(flags).eq('id', id),
      ),
    )
  }
}

export async function getCategories(
  supabase: SupabaseClient,
  projectId: string,
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}
