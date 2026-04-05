'use client'

import { BookingPageEditorView } from './BookingPageEditorView'
import type { BookingPackage } from '@/types/booking'

/**
 * Thin client wrapper for the standalone /dashboard/bookings/photo-page route.
 *
 * Provides mock packages so BookingPageEditorView renders correctly.
 * TODO(db-migration): replace MOCK_PACKAGES with Supabase fetch once
 *   booking_packages table is migrated (ARCHITECTURE-DECISIONS.md §Decision 8).
 */

const MOCK_PACKAGES: BookingPackage[] = [
  {
    id: 'pkg-1',
    name: 'Essential Session',
    description: '2-hour shoot with digital gallery delivery',
    priceCents: 65000,
    price: '$650',
    durationMinutes: 120,
    includes: ['2-hour session', '40 edited images', 'Online gallery', 'Print release'],
    applicableTypes: ['Portrait', 'Family'],
    active: true,
    sortOrder: 0,
  },
  {
    id: 'pkg-2',
    name: 'Wedding Full Day',
    description: 'Full-day wedding coverage with two shooters',
    priceCents: 350000,
    price: '$3,500',
    durationMinutes: 480,
    includes: ['8-hour coverage', '2 photographers', '500+ images', 'Engagement session', 'Online gallery'],
    applicableTypes: ['Wedding'],
    active: true,
    sortOrder: 1,
  },
  {
    id: 'pkg-3',
    name: 'Brand Intensive',
    description: 'Half-day commercial branding session',
    priceCents: 150000,
    price: '$1,500',
    durationMinutes: 240,
    includes: ['4-hour session', '80 edited images', 'Location scouting', 'Style guidance', 'Commercial license'],
    applicableTypes: ['Commercial', 'Branding'],
    active: true,
    sortOrder: 2,
  },
]

interface BookingPageEditorClientProps {
  photographerSlug: string
}

export function BookingPageEditorClient({ photographerSlug }: BookingPageEditorClientProps) {
  return (
    <BookingPageEditorView
      photographerSlug={photographerSlug}
      packages={MOCK_PACKAGES}
    />
  )
}
