import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendGalleryInvitationEmail } from '@/lib/email'
import { notifyClientAccepted } from '@/lib/notifications'

/**
 * POST /api/projects/invite
 *
 * Creates a gallery_access row with a magic token and sends the
 * invitation email via Resend.
 *
 * Body: { projectId: string, email: string, accessType?: string }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string
      email?: string
      accessType?: string
    }

    const { projectId, email, accessType = 'preview' } = body
    if (!projectId || !email) {
      return NextResponse.json({ error: 'projectId and email are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch project + verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, workspace_id')
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

    // Generate magic link token
    const token = randomUUID()
    const normalizedEmail = email.trim().toLowerCase()

    // Upsert gallery_access row
    const { error: accessError } = await supabase
      .from('gallery_access')
      .upsert(
        {
          project_id: projectId,
          email: normalizedEmail,
          token,
          access_type: accessType,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
        { onConflict: 'project_id,email' },
      )

    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 500 })
    }

    // Build gallery URL with token
    const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/gallery/${projectId}?token=${token}`

    // Get photographer name for the email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const photographerName = (profile as { display_name: string | null } | null)?.display_name ?? 'Your photographer'
    const projectName = (project as { name: string }).name

    // Send invitation email
    await sendGalleryInvitationEmail(normalizedEmail, photographerName, projectName, galleryUrl)

    return NextResponse.json({
      sent: true,
      email: normalizedEmail,
      galleryUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Invite error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Suppress unused import warning — notifyClientAccepted is used by the gallery access callback
void notifyClientAccepted
