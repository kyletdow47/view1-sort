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
  category: string
  similarity: number
  mediaId: string | null
}

export interface NearestMatchResponse {
  /** photoId → top-K matches */
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

    // Library size — used by the client to decide whether to trust the matches.
    // With fewer than ~10 embeddings we prefer to skip the override.
    const { count: libraryTotal } = await supabase
      .from('style_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('preset_id', presetId)

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

        matches[photoId] = (data as Array<{ category: string; similarity: number; media_id: string | null }> | null)?.map(
          (row) => ({
            category: row.category,
            similarity: row.similarity,
            mediaId: row.media_id,
          }),
        ) ?? []
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
