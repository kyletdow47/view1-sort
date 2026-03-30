import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/cloudflare'

interface RouteParams {
  params: Promise<{ id: string }>
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role credentials')
  return createClient(url, key)
}

/**
 * POST /api/media/[id]/sync-edit
 *
 * Accepts a multipart form upload containing the Lightroom-edited version of
 * a photo. Stores it at `edits/{mediaId}/{filename}` in Supabase Storage and
 * updates the media row with:
 *   - edited_storage_path
 *   - edited_thumbnail_url
 *   - edited_at
 *   - file_checksum (updated to the new file's fingerprint)
 *
 * The original storage_path and ai_category are preserved — AI is NOT re-run.
 *
 * Body: multipart/form-data
 *   file      — the edited image file
 *   checksum  — "{size_bytes}_{lastModified_ms}" fingerprint of the new file
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: mediaId } = await params
    const formData = await request.formData()

    const file = formData.get('file')
    const checksum = formData.get('checksum')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Fetch the existing media row to get project context and filename
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('id, project_id, filename, storage_path')
      .eq('id', mediaId)
      .single()

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const editedPath = `edits/${media.project_id}/${media.id}/${media.filename}`

    // Upload the edited file to Supabase Storage (upsert = overwrite on re-sync)
    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(editedPath, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Build public URL for the edited file
    const editedThumbnailUrl = getImageUrl(editedPath)
    const now = new Date().toISOString()

    // Update the media row — preserve storage_path and ai_category
    const { error: updateError } = await supabase
      .from('media')
      .update({
        edited_storage_path: editedPath,
        edited_thumbnail_url: editedThumbnailUrl,
        edited_at: now,
        ...(typeof checksum === 'string' && checksum ? { file_checksum: checksum } : {}),
      })
      .eq('id', mediaId)

    if (updateError) {
      return NextResponse.json({ error: `DB update failed: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      mediaId,
      editedStoragePath: editedPath,
      editedThumbnailUrl,
      editedAt: now,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sync edit error:', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
