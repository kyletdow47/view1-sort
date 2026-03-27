import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadFromUrl, getThumbnailUrl, getPreviewUrl } from '@/lib/cloudflare'

/**
 * POST /api/media/process
 *
 * Called after a photo is uploaded to Supabase Storage.
 * Pushes the image to Cloudflare Images for CDN transforms,
 * then updates the media row with cloudflare_image_id and thumbnail_url.
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
      .select('id, storage_path, file_name, project_id, cloudflare_image_id')
      .eq('id', mediaId)
      .single()

    if (mediaError || !media) {
      return NextResponse.json(
        { error: `Media not found: ${mediaError?.message ?? 'unknown'}` },
        { status: 404 },
      )
    }

    // Skip if already processed
    if (media.cloudflare_image_id) {
      return NextResponse.json({
        imageId: media.cloudflare_image_id,
        thumbnailUrl: getThumbnailUrl(media.cloudflare_image_id),
        skipped: true,
      })
    }

    // 2. Generate signed URL for the file in Supabase Storage
    const { data: signedData, error: signedError } = await supabase.storage
      .from('photos')
      .createSignedUrl(media.storage_path, 300) // 5 min expiry

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: `Failed to create signed URL: ${signedError?.message ?? 'unknown'}` },
        { status: 500 },
      )
    }

    // 3. Upload to Cloudflare Images from the signed URL
    const result = await uploadFromUrl(signedData.signedUrl, {
      mediaId: media.id,
      projectId: media.project_id,
      fileName: media.file_name,
    })

    const thumbnailUrl = getThumbnailUrl(result.imageId)
    const watermarkedUrl = getPreviewUrl(result.imageId)

    // 4. Update media row with Cloudflare data
    const { error: updateError } = await supabase
      .from('media')
      .update({
        cloudflare_image_id: result.imageId,
        thumbnail_url: thumbnailUrl,
        watermarked_url: watermarkedUrl,
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
      imageId: result.imageId,
      thumbnailUrl,
      watermarkedUrl,
      variants: result.variants,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Media processing error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
