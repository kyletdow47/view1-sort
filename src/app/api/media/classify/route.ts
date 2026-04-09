import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateMediaAIResults, type AIResultUpdate } from '@/lib/queries/media'

interface ClassifyRequestBody {
  projectId: string
  results: Array<{
    mediaId: string
    category: string
    confidence: number
  }>
  durationMs?: number
  modelId?: string
  presetId?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json() as ClassifyRequestBody
    const { projectId, results, durationMs, modelId, presetId } = body

    if (!projectId || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'projectId and results are required' }, { status: 400 })
    }

    // Validate that the project belongs to this user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build batch update payload
    const updates: AIResultUpdate[] = results.map(({ mediaId, category, confidence }) => ({
      id: mediaId,
      ai_category: category,
      ai_confidence: confidence,
    }))

    await updateMediaAIResults(supabase, updates)

    // Track this classification run
    await supabase.from('ai_sort_runs').insert({
      project_id: projectId,
      user_id: user.id,
      total_photos: results.length,
      classified_photos: results.length,
      model_id: modelId ?? 'Xenova/clip-vit-base-patch32',
      preset_id: presetId ?? null,
      duration_ms: durationMs ?? null,
    })

    return NextResponse.json({ updated: results.length, errors: [] })
  } catch (err) {
    console.error('Failed to save classify results:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
