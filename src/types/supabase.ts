// =============================================================================
// View1 Studio — Supabase TypeScript Types
// Hand-authored to match supabase/migrations/20260326000000_create_schema.sql
// =============================================================================

export type UserRole = 'photographer' | 'client'
export type UserTier = 'free' | 'pro' | 'business'
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member'
export type ProjectStatus = 'active' | 'archived' | 'published'
export type GalleryTheme = 'dark' | 'light' | 'minimal' | 'editorial'
export type PricingModel = 'free' | 'flat_fee' | 'per_photo'
export type MediaOrientation = 'landscape' | 'portrait' | 'square'
export type GalleryAccessType = 'preview' | 'full'
export type DownloadType = 'single' | 'zip' | 'all'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type InvoiceStatus = 'pending' | 'paid' | 'refunded'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type EmailStatus = 'sent' | 'failed' | 'bounced'

// ---------------------------------------------------------------------------
// Row types (matches DB columns exactly)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  tier: UserTier
  stripe_customer_id: string | null
  stripe_account_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus | null
  stripe_connect_enabled: boolean
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  slug: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  joined_at: string
}

export interface Project {
  id: string
  workspace_id: string
  name: string
  preset: string | null
  status: ProjectStatus
  cover_image_url: string | null
  gallery_public: boolean
  gallery_theme: GalleryTheme
  pricing_model: PricingModel
  flat_fee_cents: number | null
  per_photo_cents: number | null
  currency: string
  created_at: string
  updated_at: string
  // Flexible project metadata (migration 20260409000003)
  // Stores: { ai_preferences?: AIPreferences, ... }
  metadata: Record<string, unknown> | null
}

export interface Media {
  id: string
  project_id: string
  storage_path: string
  filename: string
  display_name: string | null
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  orientation: MediaOrientation | null
  cloudflare_image_id: string | null
  thumbnail_url: string | null
  watermarked_url: string | null
  ai_category: string | null
  ai_confidence: number | null
  ai_labels: Record<string, unknown> | null
  sort_order: number
  created_at: string
  // Culling analysis columns (migration 20260409000000)
  is_blurry: boolean | null
  is_duplicate: boolean | null
  is_overexposed: boolean | null
  is_underexposed: boolean | null
  culling_confidence: number | null
  // Star & review flag columns (migration 20260409000001)
  is_starred: boolean | null
  review_flag: 'keep' | 'reject' | null
}

export interface Category {
  id: string
  project_id: string
  name: string
  color: string | null
  sort_order: number
  auto_generated: boolean
}

export interface GalleryAccess {
  id: string
  project_id: string
  email: string
  token: string
  access_type: GalleryAccessType
  granted_at: string
  expires_at: string | null
  accessed_at: string | null
}

export interface GalleryDownload {
  id: string
  project_id: string
  media_id: string | null
  email: string
  download_type: DownloadType
  created_at: string
}

export interface Invoice {
  id: string
  project_id: string
  client_email: string
  amount_cents: number
  currency: string
  status: InvoiceStatus
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

export interface EmailLog {
  id: string
  to_email: string
  template: string
  subject: string
  status: EmailStatus
  metadata: Record<string, unknown> | null
  sent_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Booking {
  id: string
  workspace_id: string
  client_name: string
  client_email: string | null
  shoot_date: string
  shoot_time: string | null
  package_type: string | null
  amount_cents: number | null
  location: string | null
  notes: string | null
  status: BookingStatus
  created_at: string
  updated_at: string
}

export interface Waitlist {
  id: string
  email: string
  created_at: string
}

export interface GalleryPayment {
  id: string
  project_id: string
  stripe_session_id: string
  amount: number | null
  currency: string
  status: string
  client_email: string | null
  paid_at: string | null
  created_at: string
}

export interface StripeEvent {
  id: string
  stripe_event_id: string
  event_type: string
  processed: boolean
  processed_at: string | null
  created_at: string
}

export type GalleryStatus = 'draft' | 'published' | 'expired'

export interface Gallery {
  id: string
  project_id: string
  workspace_id: string
  title: string
  cover_photo_url: string | null
  password_protected: boolean
  password_hash: string | null
  allow_downloads: boolean
  show_powered_by: boolean
  photographer_name: string | null
  photographer_logo_url: string | null
  theme: GalleryTheme
  status: GalleryStatus
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface GallerySelection {
  id: string
  gallery_id: string
  media_id: string
  session_token: string
  created_at: string
}

export interface GalleryComment {
  id: string
  gallery_id: string
  media_id: string
  author_name: string
  author_email: string | null
  body: string
  parent_id: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Insert types (omit server-generated fields)
// ---------------------------------------------------------------------------

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type WorkspaceInsert = Omit<Workspace, 'id' | 'created_at'>
export type WorkspaceMemberInsert = Omit<WorkspaceMember, 'joined_at'>
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'metadata'> & {
  metadata?: Record<string, unknown> | null
}
export type MediaInsert = Omit<Media, 'id' | 'created_at'>
export type CategoryInsert = Omit<Category, 'id'>
export type GalleryAccessInsert = Omit<GalleryAccess, 'id' | 'token' | 'granted_at'>
export type GalleryDownloadInsert = Omit<GalleryDownload, 'id' | 'created_at'>
export type InvoiceInsert = Omit<Invoice, 'id' | 'created_at'>
export type SubscriptionInsert = Omit<Subscription, 'id' | 'created_at'>
export type EmailLogInsert = Omit<EmailLog, 'id' | 'sent_at'>
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>
export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>
export type WaitlistInsert = Omit<Waitlist, 'id' | 'created_at'>
export type GalleryPaymentInsert = Omit<GalleryPayment, 'id' | 'created_at'>
export type StripeEventInsert = Omit<StripeEvent, 'id' | 'created_at'>
export type GalleryInsert = Omit<Gallery, 'id' | 'created_at' | 'updated_at'>
export type GallerySelectionInsert = Omit<GallerySelection, 'id' | 'created_at'>
export type GalleryCommentInsert = Omit<GalleryComment, 'id' | 'created_at'>

// ---------------------------------------------------------------------------
// Update types (all fields optional except PK)
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<Omit<Profile, 'id'>>
export type WorkspaceUpdate = Partial<Omit<Workspace, 'id' | 'created_at'>>
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'workspace_id' | 'created_at'>>
export type MediaUpdate = Partial<Omit<Media, 'id' | 'project_id' | 'created_at'>>
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'project_id'>>
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'workspace_id' | 'created_at'>>
export type NotificationUpdate = Partial<Pick<Notification, 'read'>>

// Vibe Presets (migration 20260409100000)
export type VibePresetSource = 'builtin' | 'custom' | 'ai_parsed'

export interface VibePresetRow {
  id: string
  user_id: string
  project_id: string | null
  name: string
  description: string | null
  style_params: Record<string, unknown>
  is_active: boolean
  source: VibePresetSource
  created_at: string
  updated_at: string
}

export type VibePresetInsert = Omit<VibePresetRow, 'id' | 'created_at' | 'updated_at'>
export type VibePresetUpdate = Partial<Omit<VibePresetRow, 'id' | 'user_id' | 'created_at'>>

// Style Profiles (migration 20260409100001)
export interface StyleProfileRow {
  id: string
  user_id: string
  preset_id: string | null
  feedback_count: number
  personalized_mode_unlocked: boolean
  category_weights: Record<string, number>
  created_at: string
  updated_at: string
}

export type StyleProfileInsert = Omit<StyleProfileRow, 'id' | 'created_at' | 'updated_at'>
export type StyleProfileUpdate = Partial<Omit<StyleProfileRow, 'id' | 'user_id' | 'created_at'>>

// ---------------------------------------------------------------------------
// Database type (for Supabase client generic)
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      workspaces: {
        Row: Workspace
        Insert: WorkspaceInsert
        Update: WorkspaceUpdate
      }
      workspace_members: {
        Row: WorkspaceMember
        Insert: WorkspaceMemberInsert
        Update: Partial<Pick<WorkspaceMember, 'role'>>
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      media: {
        Row: Media
        Insert: MediaInsert
        Update: MediaUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      gallery_access: {
        Row: GalleryAccess
        Insert: GalleryAccessInsert
        Update: Partial<Omit<GalleryAccess, 'id' | 'project_id'>>
      }
      gallery_downloads: {
        Row: GalleryDownload
        Insert: GalleryDownloadInsert
        Update: never
      }
      invoices: {
        Row: Invoice
        Insert: InvoiceInsert
        Update: Partial<Omit<Invoice, 'id' | 'project_id' | 'created_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>
      }
      email_logs: {
        Row: EmailLog
        Insert: EmailLogInsert
        Update: never
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      bookings: {
        Row: Booking
        Insert: BookingInsert
        Update: BookingUpdate
      }
      waitlist: {
        Row: Waitlist
        Insert: WaitlistInsert
        Update: never
      }
      gallery_payments: {
        Row: GalleryPayment
        Insert: GalleryPaymentInsert
        Update: Partial<Omit<GalleryPayment, 'id' | 'project_id' | 'created_at'>>
      }
      stripe_events: {
        Row: StripeEvent
        Insert: StripeEventInsert
        Update: Partial<Omit<StripeEvent, 'id' | 'created_at'>>
      }
      vibe_presets: {
        Row: VibePresetRow
        Insert: VibePresetInsert
        Update: VibePresetUpdate
      }
      style_profiles: {
        Row: StyleProfileRow
        Insert: StyleProfileInsert
        Update: StyleProfileUpdate
      }
    }
    Enums: {
      user_role: UserRole
      user_tier: UserTier
      workspace_member_role: WorkspaceMemberRole
      project_status: ProjectStatus
      gallery_theme: GalleryTheme
      pricing_model: PricingModel
      media_orientation: MediaOrientation
      gallery_access_type: GalleryAccessType
      download_type: DownloadType
      booking_status: BookingStatus
      invoice_status: InvoiceStatus
      subscription_status: SubscriptionStatus
      email_status: EmailStatus
    }
  }
}
