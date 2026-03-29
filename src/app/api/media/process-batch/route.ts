import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/cloudflare'

/**
 * POST /api/media/process-batch
 *
 * Process all unprocessed media in a project (those missing thumbnail_url).
 * Sets public URLs from Supabase Storage.
 *
 * Body: { projectId: string, limit?: number }
 */

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string; limit?: number }
    const { projectId, limit = 50 } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Fetch unprocessed media
    const { data: mediaList, error: fetchError } = await supabase
      .from('media')
      .select('id, storage_path, file_name, project_id')
      .eq('project_id', projectId)
      .is('thumbnail_url', null)
      .limit(limit)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!mediaList || mediaList.length === 0) {
      return NextResponse.json({ processed: 0, message: 'No unprocessed media found' })
    }

    let processed = 0
    const errors: { mediaId: string; error: string }[] = []

    for (const media of mediaList) {
      try {
        const publicUrl = getImageUrl(media.storage_path)

        await supabase
          .from('media')
          .update({
            thumbnail_url: publicUrl,
            watermarked_url: publicUrl,
            status: 'processed',
          })
          .eq('id', media.id)

        processed++
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ mediaId: media.id, error: message })
      }
    }

    return NextResponse.json({
      processed,
      total: mediaList.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Batch processing error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
