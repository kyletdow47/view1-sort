import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/cloudflare'

/**
 * POST /api/media/process
 *
 * Called after a photo is uploaded to Supabase Storage.
 * Generates public URLs and updates the media row.
 *
 * Body: { mediaId: string }
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
    const body = (await request.json()) as { mediaId?: string }
    const { mediaId } = body

    if (!mediaId) {
      return NextResponse.json({ error: 'mediaId is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // 1. Fetch media row
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id, storage_path, file_name, project_id, thumbnail_url')
      .eq('id', mediaId)
      .single()

    if (mediaError || !media) {
      return NextResponse.json(
        { error: `Media not found: ${mediaError?.message ?? 'unknown'}` },
        { status: 404 },
      )
    }

    // Skip if already processed
    if (media.thumbnail_url) {
      return NextResponse.json({
        imageId: media.storage_path,
        thumbnailUrl: media.thumbnail_url,
        skipped: true,
      })
    }

    // 2. Build public URLs from Supabase Storage path
    const publicUrl = getImageUrl(media.storage_path)

    // 3. Update media row
    const { error: updateError } = await supabase
      .from('media')
      .update({
        thumbnail_url: publicUrl,
        watermarked_url: publicUrl,
        status: 'processed',
      })
      .eq('id', media.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update media row: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      imageId: media.storage_path,
      thumbnailUrl: publicUrl,
      watermarkedUrl: publicUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Media processing error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
