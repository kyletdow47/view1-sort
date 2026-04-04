// Publish / Delivery types for the 3-stage gallery delivery flow

export type DeliveryStage = 1 | 2 | 3

export interface DeliveryStageConfig {
  id: DeliveryStage
  /** Display label shown in the card header */
  label: string
  /** Short status badge label shown when this stage is active */
  activeLabel: string
  /** Body text describing what happens in this stage */
  description: string
  /** Label for the CTA button shown when this stage is active */
  ctaLabel: string
  /** Stage to advance to when the CTA is clicked; null means project complete */
  nextStage: DeliveryStage | null
  /** Tailwind border class for the active card ring */
  borderActiveClass: string
  /** Tailwind classes for the active status badge */
  badgeClasses: string
  /** Tailwind class for the CTA button gradient */
  ctaBgClass: string
  /** Tailwind text color class for stat count */
  statColorClass: string
}

export interface DeliveryStats {
  totalPhotos: number
  clientFavorites: number
  openComments: number
  editedPhotos: number
}
