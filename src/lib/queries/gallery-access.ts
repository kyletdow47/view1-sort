import type { SupabaseClient } from '@supabase/supabase-js'

export type AccessLevel = 'none' | 'preview' | 'proofing' | 'full'

export interface ResolvedAccess {
  level: AccessLevel
  hasPaid: boolean
  token: string | null
  expiresAt: string | null
}

/**
 * Resolve gallery access for a given project + viewer.
 *
 * Checks:
 * 1. gallery_access row (token-based or email-based)
 * 2. gallery_payments (has paid for this project?)
 * 3. Project settings (gallery_public, pricing_model)
 */
export async function resolveGalleryAccess(
  supabase: SupabaseClient,
  projectId: string,
  options: { token?: string; email?: string },
): Promise<ResolvedAccess> {
  const noAccess: ResolvedAccess = { level: 'none', hasPaid: false, token: null, expiresAt: null }

  // 1. Check by token
  if (options.token) {
    const { data: access } = await supabase
      .from('gallery_access')
      .select('access_type, token, expires_at, email')
      .eq('project_id', projectId)
      .eq('token', options.token)
      .single()

    if (access) {
      const isExpired = access.expires_at != null && new Date(access.expires_at) < new Date()
      if (isExpired) return noAccess

      const hasPaid = await checkPayment(supabase, projectId, access.email)
      const level = hasPaid ? 'full' : (access.access_type as AccessLevel)

      return {
        level,
        hasPaid,
        token: access.token,
        expiresAt: access.expires_at,
      }
    }
  }

  // 2. Check by email
  if (options.email) {
    const normalizedEmail = options.email.trim().toLowerCase()

    const { data: access } = await supabase
      .from('gallery_access')
      .select('access_type, token, expires_at')
      .eq('project_id', projectId)
      .eq('email', normalizedEmail)
      .single()

    if (access) {
      const isExpired = access.expires_at != null && new Date(access.expires_at) < new Date()
      if (isExpired) return noAccess

      const hasPaid = await checkPayment(supabase, projectId, normalizedEmail)
      const level = hasPaid ? 'full' : (access.access_type as AccessLevel)

      return {
        level,
        hasPaid,
        token: access.token,
        expiresAt: access.expires_at,
      }
    }
  }

  // 3. Check if project is public
  const { data: project } = await supabase
    .from('projects')
    .select('gallery_public, pricing_model, status')
    .eq('id', projectId)
    .single()

  if (project?.gallery_public && project?.status === 'published') {
    const hasPaid = options.email
      ? await checkPayment(supabase, projectId, options.email)
      : false

    return {
      level: hasPaid ? 'full' : 'preview',
      hasPaid,
      token: null,
      expiresAt: null,
    }
  }

  return noAccess
}

async function checkPayment(
  supabase: SupabaseClient,
  projectId: string,
  email: string | null,
): Promise<boolean> {
  if (!email) return false

  const { data } = await supabase
    .from('gallery_payments')
    .select('id')
    .eq('project_id', projectId)
    .eq('client_email', email.trim().toLowerCase())
    .eq('status', 'paid')
    .limit(1)

  return (data?.length ?? 0) > 0
}
