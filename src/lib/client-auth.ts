// =============================================================================
// Client Auth — Helpers for client portal authentication and access control
// =============================================================================
// Strategy:
//   - Invitation magic links are generated via Supabase Admin API + stored as
//     UUID tokens in the gallery_access table.
//   - Clients authenticate via Supabase OTP (email magic link).
//   - Access levels: 'preview' (watermarked view-only) | 'full' (download).
//   - Public galleries skip auth entirely.
//   - Password-protected galleries use the GalleryPasswordGate component.
//   - Private galleries require a valid gallery_access record.
//
// TODO(db-migration): project_clients table (17 new tables migration) will
//   replace gallery_access for multi-project client relationships. For now,
//   all client access checks use gallery_access.
// =============================================================================

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { GalleryAccessType } from '@/types/supabase'
import { randomUUID } from 'crypto'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How long an invitation token is valid (hours) */
export const INVITE_TOKEN_TTL_HOURS = 72

/** Cookie name for gallery password auth (set after correct password) */
export const GALLERY_PASSWORD_COOKIE = 'gallery_pw_access'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientInvitePayload {
  projectId: string
  clientEmail: string
  accessLevel: GalleryAccessType
  expiresAt: string // ISO string
}

export interface ClientAccessResult {
  hasAccess: boolean
  accessLevel: GalleryAccessType | null
  reason: 'public' | 'token_valid' | 'no_access' | 'token_expired' | 'not_found'
}

// ---------------------------------------------------------------------------
// Token helpers (UUID-based, stored in gallery_access table)
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random invitation token.
 * The token is a UUID stored in the gallery_access row — no payload encoding needed.
 */
export function generateInviteToken(): string {
  return randomUUID()
}

// ---------------------------------------------------------------------------
// Server-side access checks
// ---------------------------------------------------------------------------

/**
 * Checks whether a client has access to a project's gallery.
 * Reads from the gallery_access table (exists in current schema).
 *
 * TODO(project-clients): When project_clients migration runs, prefer
 * that table for multi-project relationships.
 */
export async function getClientAccessLevel(
  projectId: string,
  token: string | null
): Promise<ClientAccessResult> {
  if (!token) {
    return { hasAccess: false, accessLevel: null, reason: 'no_access' }
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('gallery_access')
    .select('access_type, expires_at')
    .eq('project_id', projectId)
    .eq('token', token)
    .single()

  if (error || !data) {
    return { hasAccess: false, accessLevel: null, reason: 'not_found' }
  }

  if (data.expires_at && data.expires_at < now) {
    return { hasAccess: false, accessLevel: null, reason: 'token_expired' }
  }

  return {
    hasAccess: true,
    accessLevel: data.access_type as GalleryAccessType,
    reason: 'token_valid',
  }
}

/**
 * Upserts a gallery_access record for a client invitation.
 * Returns the token that was created.
 */
export async function createGalleryAccessRecord(params: {
  projectId: string
  clientEmail: string
  accessLevel: GalleryAccessType
  expiresInHours?: number
}): Promise<string> {
  const { projectId, clientEmail, accessLevel, expiresInHours = INVITE_TOKEN_TTL_HOURS } = params

  const supabase = await createClient()
  const token = generateInviteToken()

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('gallery_access').upsert(
    {
      project_id: projectId,
      email: clientEmail,
      token,
      access_type: accessLevel,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: 'project_id,email' }
  )

  if (error) {
    // TODO(error-handling): Surface this error properly
    console.error('[client-auth] Failed to create gallery_access record:', error.message)
    throw new Error(`Failed to create access record: ${error.message}`)
  }

  return token
}

/**
 * Records when a client accessed their gallery (updates accessed_at).
 */
export async function markGalleryAccessed(projectId: string, token: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('gallery_access')
    .update({ accessed_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .eq('token', token)
}

// ---------------------------------------------------------------------------
// Auth requirement helpers (Server Components)
// ---------------------------------------------------------------------------

/**
 * Requires that the current user is authenticated (any role).
 * Redirects to /auth/client-login if not authenticated.
 * For use in Server Components that serve the client portal (/client).
 */
export async function requireClientPortalAuth(
  nextPath: string = '/client'
): Promise<NonNullable<Awaited<ReturnType<typeof getClientPortalSession>>>> {
  const session = await getClientPortalSession()
  if (!session) {
    redirect(`/auth/client-login?next=${encodeURIComponent(nextPath)}`)
  }
  return session
}

/**
 * Returns the current Supabase session user, or null if not authenticated.
 * Does NOT redirect — use requireClientPortalAuth for protected routes.
 */
export async function getClientPortalSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

// ---------------------------------------------------------------------------
// Invitation email helpers
// ---------------------------------------------------------------------------

/**
 * Builds the magic link URL for a gallery invitation email.
 * The link goes to /auth/client-callback?token=[uuid]&gallery=[projectId]&email=[email]
 * The token is the UUID stored in gallery_access (NOT a Supabase OTP token).
 */
export function buildInvitationCallbackUrl(params: {
  baseUrl: string
  projectId: string
  clientEmail: string
  token: string
}): string {
  const { baseUrl, projectId, clientEmail, token } = params
  const url = new URL('/auth/client-callback', baseUrl)
  url.searchParams.set('token', token)
  url.searchParams.set('gallery', projectId)
  url.searchParams.set('email', clientEmail)
  return url.toString()
}

/**
 * Builds the Supabase OTP magic link for passwordless authentication.
 * This is for the Supabase-native OTP flow (used by /auth/client-login send).
 * Wraps supabase.auth.signInWithOtp on the server side.
 *
 * NOTE: We use the Supabase client-side OTP flow (browser-side signInWithOtp)
 * for the client-login page — this helper is for server-side generation via
 * the Admin API when needed by the invitation route.
 *
 * TODO(admin-api): For server-side invite link generation, use:
 *   supabase.auth.admin.generateLink({ type: 'magiclink', email })
 * This requires the Supabase service-role client (see getServiceRoleClient in
 * src/lib/supabase/server.ts) and the supabase-js admin API.
 */
export async function generateSupabaseMagicLink(params: {
  email: string
  redirectTo: string
}): Promise<string | null> {
  // TODO(admin-api): Use supabase.auth.admin.generateLink to get a pre-generated
  // magic link URL for embedding in custom invitation emails.
  // For now, the /auth/client-login page handles OTP sending client-side.
  // This stub returns null to indicate real implementation is pending.
  console.warn('[client-auth] generateSupabaseMagicLink is a stub — use client-side signInWithOtp')
  return null
}
