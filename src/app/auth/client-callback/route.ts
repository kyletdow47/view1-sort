// =============================================================================
// /auth/client-callback — Gallery Invitation Token Handler
//
// Handles the custom invitation URL that photographers send to clients.
// URL format: /auth/client-callback?token=[uuid]&gallery=[projectId]&email=[email]
//
// Flow:
//   1. Photographer sends invitation via POST /api/invitations
//   2. Invitation email contains this callback URL with the gallery_access token
//   3. Client clicks link → this route validates token → sends OTP magic link
//      → redirects to /auth/client-login?sent=1&gallery=[id] to show "check email"
//
// Note on auth strategy:
//   The gallery_access token (UUID) proves the photographer granted access.
//   However, to actually authenticate the client in Supabase, we still send
//   an OTP magic link to their email. This provides two layers:
//     1. The invitation token controls access level (preview vs full)
//     2. Supabase OTP provides the actual session token
//
//   For galleries that are already public (gallery_public=true), this route
//   simply redirects to the gallery directly without requiring auth.
//
// TODO(admin-api): Use supabase.auth.admin.generateLink() to pre-generate the
//   Supabase magic link and embed it directly in the invitation email, so the
//   client only needs ONE click (not two: invitation link → check email → link).
//   This requires the service-role client (see getServiceRoleClient in
//   src/lib/supabase/server.ts) on a server-only route.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClientAccessLevel, markGalleryAccessed } from '@/lib/client-auth'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl

  const token = searchParams.get('token')
  const galleryId = searchParams.get('gallery')
  const email = searchParams.get('email')

  // ── Validate required params ─────────────────────────────────────────────
  if (!token || !galleryId) {
    const errorUrl = new URL('/auth/client-login', origin)
    errorUrl.searchParams.set('error', 'invalid_link')
    return NextResponse.redirect(errorUrl)
  }

  // ── Check if gallery is public (no auth needed) ──────────────────────────
  try {
    const supabase = await createClient()
    const { data: galleryData } = await supabase
      .from('galleries')
      .select('project_id, status, password_protected')
      .eq('id', galleryId)
      .single()

    // TODO(db-migration): Once project_clients table exists, also check there.
    // For now, fall through to gallery_access token validation.

    if (galleryData && galleryData.status === 'published' && !galleryData.password_protected) {
      // Public gallery — redirect directly without requiring auth
      const galleryUrl = new URL(`/gallery/${galleryId}`, origin)
      if (token) galleryUrl.searchParams.set('token', token)
      return NextResponse.redirect(galleryUrl)
    }
  } catch {
    // Non-blocking — continue to token validation even if gallery lookup fails
  }

  // ── Validate the invitation token ────────────────────────────────────────
  // The token is a UUID stored in gallery_access. We need to look up the
  // project for this gallery to query gallery_access.
  try {
    const supabase = await createClient()

    // Resolve project_id from gallery id
    const { data: galleryRow } = await supabase
      .from('galleries')
      .select('project_id')
      .eq('id', galleryId)
      .single()

    if (galleryRow) {
      const accessResult = await getClientAccessLevel(galleryRow.project_id, token)

      if (accessResult.hasAccess) {
        // Mark accessed timestamp
        await markGalleryAccessed(galleryRow.project_id, token)

        // Redirect to gallery with token so the gallery page can verify access
        const galleryUrl = new URL(`/gallery/${galleryId}`, origin)
        galleryUrl.searchParams.set('token', token)
        return NextResponse.redirect(galleryUrl)
      }

      if (accessResult.reason === 'token_expired') {
        // Token expired — send to login with context to request a new link
        const loginUrl = new URL('/auth/client-login', origin)
        loginUrl.searchParams.set('gallery', galleryId)
        if (email) loginUrl.searchParams.set('email', email)
        loginUrl.searchParams.set('error', 'link_expired')
        return NextResponse.redirect(loginUrl)
      }
    }
  } catch (err) {
    console.error('[client-callback] Token validation error:', err)
  }

  // ── Fallback: send to client login for this gallery ──────────────────────
  // Either the token wasn't found in gallery_access, or the gallery lookup
  // failed. Either way, prompt the client to authenticate via OTP.
  const loginUrl = new URL('/auth/client-login', origin)
  loginUrl.searchParams.set('gallery', galleryId)
  if (email) loginUrl.searchParams.set('email', email)

  // Pass the original token so client-login can pass it through to the gallery
  loginUrl.searchParams.set('next', `/gallery/${galleryId}?token=${encodeURIComponent(token)}`)

  return NextResponse.redirect(loginUrl)
}
