// =============================================================================
// Client Checkout — Types
// =============================================================================

/** A purchasable package option */
export interface CheckoutPackage {
  id: string
  name: string
  description: string
  price: number // cents
  priceLabel: string
  includes: string[]
  highlight?: boolean
}

/** A selected photo item in the cart */
export interface CheckoutPhotoItem {
  id: string
  thumbnailUrl: string | null
  name: string
  pricePerPhoto: number // cents
}

/** The order — either a package purchase or individual photo selection */
export type CheckoutOrderType = 'package' | 'individual' | 'full_gallery'

export interface CheckoutOrder {
  type: CheckoutOrderType
  galleryId: string
  galleryName: string
  selectedPackageId: string | null
  selectedPhotoIds: string[]
  subtotal: number // cents
  tax: number // cents
  total: number // cents
}

/** Checkout step state */
export type CheckoutStep = 'select' | 'review' | 'payment' | 'success'

/** Payment intent response from /api/checkout/create-payment-intent */
export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
}

/** Download link issued after successful payment */
export interface DownloadLink {
  label: string
  url: string
  expiresAt: string
}

/** Props shared across checkout sub-components */
export interface CheckoutBrandProps {
  brand: import('./client-portal').PhotographerBrand
}

/** Pricing model for a gallery */
export type GalleryPricingModel = 'free' | 'per_photo' | 'flat_fee' | 'package'
