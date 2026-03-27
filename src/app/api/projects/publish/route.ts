import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/projects/publish
 *
 * Publishes a project: sets status to 'published', optionally updates
 * gallery_theme and gallery_public.
 *
 * Body: { projectId: string, theme?: string, galleryPublic?: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string
      theme?: string
      galleryPublic?: boolean
    }

    const { projectId, theme, galleryPublic } = body
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership via workspace
    const { data: project } = await supabase
      .from('projects')
      .select('id, workspace_id, name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', (project as { workspace_id: string }).workspace_id)
      .single()

    if (!workspace || (workspace as { owner_id: string }).owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update project status
    const updateFields: Record<string, unknown> = {
      status: 'published',
      updated_at: new Date().toISOString(),
    }
    if (theme) updateFields.gallery_theme = theme
    if (galleryPublic !== undefined) updateFields.gallery_public = galleryPublic

    const { error: updateError } = await supabase
      .from('projects')
      .update(updateFields)
      .eq('id', projectId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/gallery/${projectId}`

    return NextResponse.json({
      published: true,
      galleryUrl,
      projectName: (project as { name: string }).name,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
