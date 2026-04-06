/**
 * Gallery Demo Checkout — /gallery/demo/checkout
 *
 * Static demo route that renders CheckoutView with hardcoded mock data.
 * Skips Supabase entirely — used by QA to visually verify the client checkout
 * flow without a live database record.
 *
 * QA task unblocked:
 *   - [QA] Client Checkout & Payment Flow — GID: 1213959156303058
 */

import type { Metadata } from 'next'
import { CheckoutView } from '@/components/features/checkout/CheckoutView'
import type { PhotographerBrand } from '@/types/client-portal'

export const metadata: Metadata = {
  title: 'Checkout — Johnson Wedding | Sarah Chen Photography',
  robots: { index: false, follow: false },
}

interface DemoCheckoutPageProps {
  searchParams: Promise<{ paid?: string }>
}

// ---------------------------------------------------------------------------
// Mock photographer brand
// ---------------------------------------------------------------------------

const DEMO_BRAND: PhotographerBrand = {
  name: 'Sarah Chen Photography',
  tagline: 'Capturing timeless moments',
  avatarUrl: null,
  avatarInitials: 'SC',
  accentColor: '#5749F4',
  contactEmail: 'sarah@sarachenphotography.com',
  contactPhone: '(415) 555-0182',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function GalleryDemoCheckoutPage({
  searchParams,
}: DemoCheckoutPageProps) {
  const { paid } = await searchParams

  return (
    <CheckoutView
      galleryId="demo"
      galleryName="Johnson Wedding — June 2026"
      pricingModel="package"
      brand={DEMO_BRAND}
      initialPhotoIds={[]}
      perPhotoCents={1500}
      initialStep={paid === 'true' ? 'success' : 'select'}
    />
  )
}
