import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import type { SortedPhoto } from '@/lib/ai/sort-executor'

/**
 * POST /api/media/classify-batch
 *
 * Persists AI sort results to the media table.
 *
 * Accepts an array of SortedPhoto from the sort executor and writes the
 * assigned category, confidence, top label, sort rank, and status for
 * each photo. Rejected photos get status = 'rejected'.
 *
 * Body: { projectId: string, sorted: SortedPhoto[] }
 */

interface ClassifyBatchBody {
  projectId?: string
  sorted?: SortedPhoto[]
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ClassifyBatchBody
    const { projectId, sorted } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    if (!Array.isArray(sorted) || sorted.length === 0) {
      return NextResponse.json({ error: 'sorted must be a non-empty array' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    let updated = 0
    const errors: Array<{ photoId: string; error: string }> = []

    for (const photo of sorted) {
      try {
        const update = {
          ai_category: photo.category,
          ai_confidence: photo.confidence,
          ai_labels: {
            topLabel: photo.topLabel,
            categoryPriority: photo.categoryPriority,
            rankInCategory: photo.rankInCategory,
            rejectReason: photo.rejectReason ?? null,
          },
          sort_order: photo.rankInCategory,
          status: photo.rejected ? 'rejected' : 'classified',
        }

        const { error } = await supabase
          .from('media')
          .update(update)
          .eq('id', photo.photoId)
          .eq('project_id', projectId)

        if (error) {
          errors.push({ photoId: photo.photoId, error: error.message })
        } else {
          updated++
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push({ photoId: photo.photoId, error: message })
      }
    }

    return NextResponse.json({
      updated,
      total: sorted.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/media/classify-batch]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
