/**
 * Client Checkout Page — /gallery/[id]/checkout
 *
 * Enhanced checkout experience with:
 *   - Package selection (digital, prints+digital, album+digital)
 *   - Photographer branding in header
 *   - Embedded Stripe Elements payment form (placeholder — wire up @stripe/react-stripe-js)
 *   - Success page with download links
 *
 * Backend: POST /api/gallery/[id]/checkout creates a Stripe Checkout Session.
 * TODO: Migrate to PaymentIntent + Stripe Elements embedded flow (requires Stripe.js setup).
 */

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutView } from '@/components/features/checkout/CheckoutView'
import type { Project } from '@/types/supabase'
import type { PhotographerBrand } from '@/types/client-portal'

export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ photos?: string; paid?: string }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { id } = await params
  const { photos: photosParam, paid } = await searchParams

  const supabase = await createClient()

  // ── Fetch project ──────────────────────────────────────────────────────────
  const { data: projectData } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!projectData) notFound()
  const project = projectData as Project

  // Free galleries don't have a checkout flow
  if (project.pricing_model === 'free') {
    redirect(`/gallery/${id}`)
  }

  // ── Resolve photographer branding ──────────────────────────────────────────
  let brand: PhotographerBrand = {
    name: 'Photographer',
    tagline: null,
    avatarUrl: null,
    avatarInitials: 'P',
    accentColor: '#5749F4',
    contactEmail: null,
    contactPhone: null,
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id, name')
    .eq('id', project.workspace_id)
    .single()

  if (workspace) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', workspace.owner_id)
      .single()

    const displayName =
      profile?.display_name ?? workspace.name ?? 'Photographer'
    brand = {
      ...brand,
      name: displayName,
      avatarUrl: profile?.avatar_url ?? null,
      avatarInitials: displayName.charAt(0).toUpperCase(),
    }
  }

  // ── Parse pre-selected photo IDs from query param ─────────────────────────
  // e.g. /gallery/[id]/checkout?photos=img1,img2,img3
  const initialPhotoIds = photosParam
    ? photosParam.split(',').filter(Boolean)
    : []

  // ── Determine per-photo price ──────────────────────────────────────────────
  const perPhotoCents = project.per_photo_cents ?? 1500 // $15 default

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <CheckoutView
      galleryId={id}
      galleryName={project.name}
      pricingModel={project.pricing_model ?? 'package'}
      brand={brand}
      initialPhotoIds={initialPhotoIds}
      perPhotoCents={perPhotoCents}
      // paid=true means Stripe Checkout redirect completed — jump to success
      initialStep={paid === 'true' ? 'success' : 'select'}
    />
  )
}
