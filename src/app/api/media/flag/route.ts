import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FlagPayload {
  mediaIds: string[]
  is_starred?: boolean
  review_flag?: 'keep' | 'reject' | null
}

/**
 * PATCH /api/media/flag — batch update star / review_flag on media items.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as FlagPayload
  if (!body.mediaIds || body.mediaIds.length === 0) {
    return NextResponse.json({ error: 'mediaIds required' }, { status: 400 })
  }

  const updateFields: Record<string, unknown> = {}
  if (body.is_starred !== undefined) updateFields.is_starred = body.is_starred
  if (body.review_flag !== undefined) updateFields.review_flag = body.review_flag

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: 'No update fields provided' }, { status: 400 })
  }

  const { error } = await supabase
    .from('media')
    .update(updateFields)
    .in('id', body.mediaIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, updated: body.mediaIds.length })
}
