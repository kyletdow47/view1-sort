import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/style/nearest-match
 *
 * Batch endpoint. Takes an array of { photoId, embedding } + a preset, and
 * returns, for each, the K nearest matches from the caller's personal style
 * library. classifyBatch uses this to override CLIP predictions when the
 * user has previously corrected similar-looking photos.
 */

const EMBEDDING_DIM = 512
const MAX_BATCH = 50
const DEFAULT_K = 5

interface BatchQuery {
  photoId: string
  embedding: number[]
}

interface NearestMatch {
  /** The category the user assigned to this neighbor */
  category: string
  /** Raw cosine similarity in [0, 1]. Use this for "are they actually similar?" checks. */
  similarity: number
  /**
   * similarity × exp(-ln2 × age_days / 90).
   * This is the weight the client should use when summing votes — it lets
   * recent corrections outweigh months-old ones without the client needing
   * to know the half-life constant.
   */
  weight: number
  /** Age of the neighbor in days (for UI / debugging). */
  ageDays: number
  /** Source label: 'correction' | 'confirm' | 'import'. Corrections are stronger signal. */
  source: 'correction' | 'confirm' | 'import'
  /**
   * Counts of rejections recorded on this neighbor's media_id, keyed by
   * category. When a new photo is very similar to this neighbor and we're
   * considering category C, {"C": 3} should down-weight that vote by
   * ~log(1 + 3) ≈ 1.4× penalty.
   */
  rejections: Record<string, number>
  mediaId: string | null
}

export interface NearestMatchResponse {
  /** photoId → top-K matches (ordered by similarity desc) */
  matches: Record<string, NearestMatch[]>
  /** Total number of style embeddings in the caller's library for this preset */
  libraryTotal: number
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as {
      presetId?: string
      queries?: BatchQuery[]
      k?: number
    }

    const { presetId, queries, k = DEFAULT_K } = body

    if (!presetId || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'presetId and queries[] are required' },
        { status: 400 },
      )
    }

    if (queries.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Too many queries (max ${MAX_BATCH} per batch)` },
        { status: 400 },
      )
    }

    // Validate each embedding shape before hitting Postgres
    for (const q of queries) {
      if (typeof q.photoId !== 'string' || !Array.isArray(q.embedding) || q.embedding.length !== EMBEDDING_DIM) {
        return NextResponse.json(
          { error: `Each query must have {photoId: string, embedding: number[${EMBEDDING_DIM}]}` },
          { status: 400 },
        )
      }
    }

    // Library size — used by the client to decide how much to trust matches.
    // Scoped to the caller (RLS already enforces this but being explicit
    // avoids relying on that implicit filter) *and* to the active preset.
    // The client ramps personalisation influence in linearly from N=3 → N=20.
    const { count: libraryTotal } = await supabase
      .from('style_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('preset_id', presetId)
      .eq('user_id', user.id)

    // Run the nearest-match RPC once per query. pgvector handles the per-call
    // work efficiently; batching inside a single SQL statement would require
    // a more complex RPC and gains little at this scale.
    const matches: Record<string, NearestMatch[]> = {}

    await Promise.all(
      queries.map(async ({ photoId, embedding }) => {
        const { data, error } = await supabase.rpc('find_nearest_style_matches', {
          p_preset_id: presetId,
          p_query_embedding: embedding,
          p_k: k,
        })

        if (error) {
          console.warn('[nearest-match] RPC error for', photoId, error.message)
          matches[photoId] = []
          return
        }

        type Row = {
          category: string
          similarity: number
          weight: number
          age_days: number
          media_id: string | null
          source: string | null
          rejections: Record<string, number> | null
        }
        matches[photoId] = (data as Row[] | null)?.map((row) => ({
          category: row.category,
          similarity: row.similarity,
          weight: row.weight,
          ageDays: row.age_days,
          source: (row.source as NearestMatch['source']) ?? 'correction',
          rejections: row.rejections ?? {},
          mediaId: row.media_id,
        })) ?? []
      }),
    )

    return NextResponse.json({
      matches,
      libraryTotal: libraryTotal ?? 0,
    } satisfies NearestMatchResponse)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[nearest-match]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
