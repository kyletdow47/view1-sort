import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/style-profile — fetch the user's aggregate style profile.
 * Query param ?presetId= to filter by preset (optional).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const presetId = new URL(request.url).searchParams.get('presetId')

  let query = supabase
    .from('style_profiles')
    .select('*')
    .eq('user_id', user.id)

  if (presetId) {
    query = query.eq('preset_id', presetId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate across all preset-specific profiles
  const totalFeedback = (data ?? []).reduce((sum, row) => sum + row.feedback_count, 0)
  const mergedWeights: Record<string, number> = {}
  for (const row of data ?? []) {
    const weights = row.category_weights as Record<string, number>
    for (const [key, val] of Object.entries(weights)) {
      mergedWeights[key] = val // latest wins
    }
  }

  return NextResponse.json({
    feedbackCount: totalFeedback,
    personalizedModeUnlocked: totalFeedback >= 20,
    categoryWeights: mergedWeights,
    profiles: data,
  })
}

/**
 * POST /api/style-profile — record feedback (upsert style profile row).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    presetId: string
    category: string
    accepted: boolean
  }

  if (!body.presetId || !body.category) {
    return NextResponse.json({ error: 'presetId and category required' }, { status: 400 })
  }

  // Fetch or create the profile row for this user+preset
  const { data: existing } = await supabase
    .from('style_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('preset_id', body.presetId)
    .maybeSingle()

  const weightKey = `${body.presetId}:${body.category}`
  const currentWeights = (existing?.category_weights ?? {}) as Record<string, number>
  const currentVal = currentWeights[weightKey] ?? 1.0
  const delta = body.accepted ? 0.1 : -0.1
  const newVal = Math.max(0.2, Math.min(2.0, currentVal + delta))
  const newWeights = { ...currentWeights, [weightKey]: newVal }

  const newCount = (existing?.feedback_count ?? 0) + 1
  const unlocked = newCount >= 20

  if (existing) {
    const { data, error } = await supabase
      .from('style_profiles')
      .update({
        feedback_count: newCount,
        personalized_mode_unlocked: unlocked,
        category_weights: newWeights,
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ profile: data })
  }

  // Insert new
  const { data, error } = await supabase
    .from('style_profiles')
    .insert({
      user_id: user.id,
      preset_id: body.presetId,
      feedback_count: newCount,
      personalized_mode_unlocked: unlocked,
      category_weights: newWeights,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data }, { status: 201 })
}
