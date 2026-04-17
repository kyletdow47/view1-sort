/**
 * saveSortToProject — persist the outcome of an AI sort session.
 *
 * Creates a project row, stores the File blobs locally in IndexedDB, and
 * inserts `media` rows that reference them with `storage_path = 'local:{hash}'`.
 * No cloud storage is consumed at this stage.
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { createProject } from '@/lib/queries/projects'
import type { Project, ProjectInsert } from '@/types/supabase'
import { buildLocalStoragePath, putLocalPhoto, sha256 } from './index'

export interface SaveSortFile {
  file: File
  category: string | null
  score?: number
}

export interface SaveSortResult {
  project: Project
  mediaInserted: number
  mediaFailed: number
}

async function getFirstWorkspaceId(): Promise<string> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(`Failed to load workspace: ${error.message}`)
  const workspace = data?.[0]
  if (!workspace) throw new Error('No workspace for user')
  return workspace.id as string
}

/**
 * Create a project, save blobs to IndexedDB, and insert media rows that
 * point to the local blobs (storage_path = `local:{hash}`).
 */
export async function saveSortToProject(
  projectName: string,
  files: SaveSortFile[],
  opts: { preset?: ProjectInsert['preset']; workspaceId?: string } = {},
): Promise<SaveSortResult> {
  const supabase = createClient()
  const workspaceId = opts.workspaceId ?? (await getFirstWorkspaceId())

  const project = await createProject(supabase, {
    workspace_id: workspaceId,
    name: projectName.trim() || 'Untitled sort',
    preset: opts.preset ?? null,
    status: 'active',
    cover_image_url: null,
    gallery_public: false,
    gallery_theme: 'dark',
    pricing_model: 'free',
    flat_fee_cents: null,
    per_photo_cents: null,
    currency: 'usd',
  })

  let mediaInserted = 0
  let mediaFailed = 0

  for (const [index, item] of files.entries()) {
    try {
      const hash = await sha256(item.file)
      await putLocalPhoto(project.id, item.file, item.category)

      const { error } = await supabase.from('media').insert({
        project_id: project.id,
        storage_path: buildLocalStoragePath(hash),
        filename: item.file.name,
        mime_type: item.file.type || 'application/octet-stream',
        size_bytes: item.file.size,
        ai_category: item.category,
        ai_confidence: item.score ?? null,
        sort_order: index,
        file_hash: hash,
        status: 'uploaded',
      })

      if (error) {
        console.error('Insert media row failed:', error)
        mediaFailed++
      } else {
        mediaInserted++
      }
    } catch (err) {
      console.error('Save local photo failed:', err)
      mediaFailed++
    }
  }

  return { project, mediaInserted, mediaFailed }
}
