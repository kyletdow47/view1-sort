/**
 * Booking pipeline types for View1 Sort.
 * Booking stages mirror client pipeline: Inquiry → Quoted → Booked → Shooting → Delivered → Paid
 */

export type BookingStage =
  | 'inquiry'
  | 'quoted'
  | 'booked'
  | 'shooting'
  | 'delivered'
  | 'paid'

export type BookingType =
  | 'Wedding'
  | 'Engagement'
  | 'Portrait'
  | 'Family'
  | 'Newborn'
  | 'Maternity'
  | 'Commercial'
  | 'Branding'
  | 'Corporate'
  | 'Event'
  | 'Mini Session'
  | 'Elopement'
  | 'Other'

export interface BookingRecord {
  /** Unique identifier */
  id: string
  /** Client name */
  clientName: string
  /** Client email */
  clientEmail: string
  /** Client phone */
  clientPhone?: string
  /** Booking type / shoot type */
  bookingType: BookingType
  /** Formatted price string, e.g. "$2.5k" */
  price: string
  /** Price in cents */
  priceCents: number
  /** Deposit amount in cents */
  depositCents: number
  /** Whether deposit has been paid */
  depositPaid: boolean
  /** Pipeline stage */
  stage: BookingStage
  /** ISO date of shoot */
  shootDate?: string
  /** ISO date inquiry was received */
  createdAt: string
  /** ISO date of last update */
  updatedAt: string
  /** Linked package id */
  packageId?: string
  /** Photographer's private notes */
  notes?: string
  /** Reference to Supabase project id (once converted to project) */
  projectId?: string
}

export interface BookingPackage {
  id: string
  name: string
  description: string
  /** Price in cents */
  priceCents: number
  /** Formatted price string */
  price: string
  /** Duration in minutes */
  durationMinutes: number
  /** List of included deliverables */
  includes: string[]
  /** Shoot types this package applies to */
  applicableTypes: BookingType[]
  /** Whether package is active / visible on booking page */
  active: boolean
  /** Display order */
  sortOrder: number
}

export interface AvailabilitySlot {
  /** ISO date string, e.g. "2026-04-10" */
  date: string
  /** Whether the photographer is available */
  available: boolean
  /** If booked, the booking id */
  bookingId?: string
  /** If booked, the client name */
  clientName?: string
  /** AM / PM / all-day */
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all-day'
}

export interface BookingPageConfig {
  /** Photographer slug for public URL */
  slug: string
  /** Studio display name */
  studioName: string
  /** Bio paragraph */
  bio: string
  /** Headline shown on booking page */
  headline: string
  /** Banner image URL */
  bannerImageUrl?: string
  /** Profile photo URL */
  profilePhotoUrl?: string
  /** Show testimonials section */
  showTestimonials: boolean
  /** Show portfolio gallery section */
  showPortfolio: boolean
  /** Custom CTA button text */
  ctaText: string
  /** Deposit percentage required (0-100) */
  depositPercent: number
  /** Enable instant booking (no manual approval) */
  instantBooking: boolean
}

export type BookingTabKey = 'inbox' | 'packages' | 'calendar' | 'page-editor' | 'settings'

export interface BookingFilters {
  search: string
  stage: BookingStage | 'all'
  bookingType: BookingType | 'all'
}

export interface NewBookingFormData {
  clientName: string
  clientEmail: string
  clientPhone?: string
  bookingType: BookingType
  priceCents: number
  depositCents: number
  shootDate?: string
  packageId?: string
  stage: BookingStage
  notes?: string
}

/** A client testimonial displayed on the public booking page */
export interface BookingTestimonial {
  id: string
  clientName: string
  clientHandle?: string
  quote: string
  /** 1–5 stars */
  rating: number
  shootType?: BookingType
  date?: string
}

/** Keys for each draggable page section */
export type PageSectionKey = 'hero' | 'packages' | 'portfolio' | 'testimonials' | 'contact'

/** A draggable/toggleable page section in the booking page builder */
export interface PageSection {
  key: PageSectionKey
  label: string
  icon: string
  enabled: boolean
  sortOrder: number
}

/** SEO metadata for the public booking page */
export interface BookingPageSEO {
  title: string
  description: string
  ogImageUrl?: string
}

/** Custom domain configuration */
export interface BookingCustomDomain {
  domain: string
  status: 'unverified' | 'verifying' | 'verified' | 'error'
}

/** A single field in the contact / booking request form */
export interface ContactFormField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea'
  required: boolean
  enabled: boolean
  options?: string[]
}
