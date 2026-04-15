import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/style/capture-correction
 *
 * Persists a single CLIP embedding + category assignment into the user's
 * personal style library. Fires whenever the user drags a photo from one
 * AI-predicted category to a different one, or explicitly confirms an
 * AI suggestion.
 *
 * The embedding is computed client-side (in the CLIP Web Worker) and
 * posted here so we don't re-run the model server-side.
 */

export const EMBEDDING_DIM = 512

interface CaptureCorrectionBody {
  mediaId: string
  presetId: string
  category: string
  embedding: number[]
  source?: 'correction' | 'confirm' | 'import'
  confidence?: number
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as Partial<CaptureCorrectionBody>
    const { mediaId, presetId, category, embedding, source = 'correction', confidence } = body

    if (!mediaId || !presetId || !category) {
      return NextResponse.json(
        { error: 'mediaId, presetId, and category are required' },
        { status: 400 },
      )
    }

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIM) {
      return NextResponse.json(
        { error: `embedding must be an array of ${EMBEDDING_DIM} floats` },
        { status: 400 },
      )
    }

    // Sanity-check: make sure the media belongs to a project the caller owns.
    const { data: media, error: mediaErr } = await supabase
      .from('media')
      .select('id, project_id')
      .eq('id', mediaId)
      .single()

    if (mediaErr || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Upsert via the RPC which enforces auth.uid() = user_id.
    const { data, error } = await supabase.rpc('upsert_style_embedding', {
      p_media_id: mediaId,
      p_preset_id: presetId,
      p_category: category,
      p_embedding: embedding,
      p_source: source,
      p_confidence: confidence ?? null,
    })

    if (error) {
      console.error('[capture-correction] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data, ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[capture-correction]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
