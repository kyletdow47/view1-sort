import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// Dynamic imports for email
async function loadEmail() {
  const [{ sendEmail }, { galleryInvitationEmail }] = await Promise.all([
    import('@/lib/email/send'),
    import('@/lib/email/templates'),
  ])
  return { sendEmail, galleryInvitationEmail }
}
import crypto from 'crypto'

interface InviteRequestBody {
  email: string
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params

  let body: InviteRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { email } = body
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify project exists and get details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, workspace_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  // Get photographer name
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', project.workspace_id)
    .single()

  let photographerName = 'Your Photographer'
  if (workspace) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', workspace.owner_id)
      .single()
    if (profile?.display_name) {
      photographerName = profile.display_name
    }
  }

  // Count media for the email
  const { count: photoCount } = await supabase
    .from('media')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  // Generate unique access token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30-day expiry

  // Check if access already exists for this email + project
  const { data: existingAccess } = await supabase
    .from('gallery_access')
    .select('id')
    .eq('project_id', projectId)
    .eq('email', email.toLowerCase())
    .single()

  if (existingAccess) {
    // Update existing access with new token
    await supabase
      .from('gallery_access')
      .update({
        token,
        expires_at: expiresAt.toISOString(),
        access_type: 'preview',
      })
      .eq('id', existingAccess.id)
  } else {
    // Create new access row
    const { error: insertError } = await supabase.from('gallery_access').insert({
      project_id: projectId,
      email: email.toLowerCase(),
      token,
      access_type: 'preview',
      expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
      console.error('[invite] Failed to create gallery_access:', insertError)
      return NextResponse.json({ error: 'Failed to create access.' }, { status: 500 })
    }
  }

  // Build gallery URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://photo-sorter-theta.vercel.app'
  const galleryUrl = `${appUrl}/gallery/${projectId}?token=${token}`

  // Send invitation email
  const { sendEmail, galleryInvitationEmail } = await loadEmail()
  const emailTemplate = galleryInvitationEmail(
    project.name,
    photographerName,
    galleryUrl,
    photoCount ?? 0
  )

  const emailResult = await sendEmail({
    to: email.toLowerCase(),
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  })

  return NextResponse.json({
    success: true,
    emailSent: emailResult.success,
    galleryUrl,
    expiresAt: expiresAt.toISOString(),
  })
}
