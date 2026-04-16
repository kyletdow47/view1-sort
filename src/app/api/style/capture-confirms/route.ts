import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/style/capture-confirms
 *
 * Batch endpoint for confirm-style signals. Fires when the user has
 * implicitly approved a batch of AI predictions (e.g. clicked "Approve All",
 * advanced to Publish, or idled on the sort view without corrections).
 *
 * Every photo the user *doesn't* move after AI-sort is a positive signal
 * that CLIP's guess was right. Previously we threw those away. Capturing
 * them takes the library from zero to 100+ examples in one session,
 * which is where the personalisation layer starts to feel magical.
 *
 * Design notes:
 *   * Bulk upsert via `bulk_upsert_style_embeddings` RPC — one round trip
 *     instead of N.
 *   * Confirms NEVER overwrite corrections. The RPC enforces that.
 *     Corrections are deliberate disagreements and carry more signal.
 *   * No rejection side-effect here — a confirm is neutral-to-positive,
 *     it doesn't imply "not that other category". Only explicit moves do.
 */

const EMBEDDING_DIM = 512
const MAX_BATCH = 200

interface ConfirmItem {
  mediaId: string
  category: string
  embedding: number[]
  confidence?: number
}

interface CaptureConfirmsBody {
  presetId: string
  items: ConfirmItem[]
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as Partial<CaptureConfirmsBody>
    const { presetId, items } = body

    if (!presetId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'presetId and items[] are required' },
        { status: 400 },
      )
    }

    if (items.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Too many items (max ${MAX_BATCH} per batch)` },
        { status: 400 },
      )
    }

    // Validate shape + collect the media_ids we'll need to ownership-check.
    const mediaIds: string[] = []
    for (const it of items) {
      if (
        typeof it.mediaId !== 'string' ||
        typeof it.category !== 'string' ||
        !Array.isArray(it.embedding) ||
        it.embedding.length !== EMBEDDING_DIM
      ) {
        return NextResponse.json(
          {
            error: `Each item needs {mediaId: string, category: string, embedding: number[${EMBEDDING_DIM}]}`,
          },
          { status: 400 },
        )
      }
      mediaIds.push(it.mediaId)
    }

    // Ownership check — RLS on the RPC also enforces this, but catching it
    // here lets us return a crisp 404 rather than a silent skip.
    const { data: ownedMedia, error: mediaErr } = await supabase
      .from('media')
      .select('id')
      .in('id', mediaIds)

    if (mediaErr) {
      console.error('[capture-confirms] media lookup error:', mediaErr)
      return NextResponse.json({ error: mediaErr.message }, { status: 500 })
    }

    const ownedSet = new Set((ownedMedia ?? []).map((m) => m.id))
    const accepted = items.filter((it) => ownedSet.has(it.mediaId))

    if (accepted.length === 0) {
      return NextResponse.json({ ok: true, captured: 0, skipped: items.length })
    }

    // Shape the payload to match the bulk_upsert_style_embeddings signature.
    const payload = accepted.map((it) => ({
      media_id: it.mediaId,
      preset_id: presetId,
      category: it.category,
      embedding: it.embedding,
      source: 'confirm',
      confidence: it.confidence ?? null,
    }))

    const { data, error } = await supabase.rpc('bulk_upsert_style_embeddings', {
      p_items: payload,
    })

    if (error) {
      console.error('[capture-confirms] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      captured: typeof data === 'number' ? data : accepted.length,
      skipped: items.length - accepted.length,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[capture-confirms]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
