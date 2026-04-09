import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { VibeStyleParams } from '@/types/vibe-presets'

/* GET /api/presets — list user's presets */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('vibe_presets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ presets: data })
}

/* POST /api/presets — create a new preset */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    name: string
    description?: string
    styleParams: VibeStyleParams
    projectId?: string
    source?: 'custom' | 'ai_parsed'
  }

  if (!body.name || !body.styleParams) {
    return NextResponse.json({ error: 'name and styleParams are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vibe_presets')
    .insert({
      user_id: user.id,
      project_id: body.projectId ?? null,
      name: body.name,
      description: body.description ?? null,
      style_params: body.styleParams as unknown as Record<string, unknown>,
      source: body.source ?? 'custom',
      is_active: false,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preset: data }, { status: 201 })
}

/* PUT /api/presets — update an existing preset */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    id: string
    name?: string
    description?: string
    styleParams?: VibeStyleParams
    isActive?: boolean
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const updateFields: Record<string, unknown> = {}
  if (body.name !== undefined) updateFields.name = body.name
  if (body.description !== undefined) updateFields.description = body.description
  if (body.styleParams !== undefined) updateFields.style_params = body.styleParams
  if (body.isActive !== undefined) updateFields.is_active = body.isActive

  // If activating a preset, deactivate all others first
  if (body.isActive) {
    await supabase
      .from('vibe_presets')
      .update({ is_active: false })
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('vibe_presets')
    .update(updateFields)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preset: data })
}

/* DELETE /api/presets — delete a preset */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('vibe_presets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
