// =============================================================================
// Client Portal — Types
// =============================================================================

import type { GalleryTheme, PricingModel, MediaOrientation } from './supabase'

/** A gallery as seen by the client in their portal */
export interface ClientGallery {
  id: string
  name: string
  coverUrl: string | null
  photoCount: number
  status: ClientGalleryStatus
  shootDate: string | null
  createdAt: string
  theme: GalleryTheme
  pricingModel: PricingModel
}

export type ClientGalleryStatus =
  | 'ready_to_view'
  | 'pending_selection'
  | 'downloads_ready'
  | 'processing'
  | 'expired'

/** Pending action card shown at top of client portal */
export interface PendingAction {
  id: string
  label: string
  action: string
  type: 'invoice' | 'contract' | 'questionnaire'
  href: string
}

/** Photographer branding shown in client portal header */
export interface PhotographerBrand {
  name: string
  tagline: string | null
  avatarUrl: string | null
  avatarInitials: string
  accentColor: string
  contactEmail: string | null
  contactPhone: string | null
}

/** A favorited photo thumbnail in the favorites strip */
export interface FavoritePhoto {
  id: string
  thumbnailUrl: string
  alt: string
  orientation: MediaOrientation | null
}

/** Status → display mapping */
export const GALLERY_STATUS_CONFIG: Record<
  ClientGalleryStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  ready_to_view: {
    label: 'Ready to View',
    colorClass: 'text-emerald-400 bg-emerald-400/15',
    dotClass: 'bg-emerald-400',
  },
  pending_selection: {
    label: 'Pending Selection',
    colorClass: 'text-amber-400 bg-amber-400/15',
    dotClass: 'bg-amber-400',
  },
  downloads_ready: {
    label: 'Downloads Ready',
    colorClass: 'text-blue-400 bg-blue-400/15',
    dotClass: 'bg-blue-400',
  },
  processing: {
    label: 'Processing',
    colorClass: 'text-purple-400 bg-purple-400/15',
    dotClass: 'bg-purple-400',
  },
  expired: {
    label: 'Expired',
    colorClass: 'text-zinc-500 bg-zinc-500/15',
    dotClass: 'bg-zinc-500',
  },
}
