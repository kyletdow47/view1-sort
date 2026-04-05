/**
 * Client & CRM types for View1 Sort.
 * Pipeline stages: Inquiry → Quoted → Booked → Shooting → Delivered → Paid
 */

export type ClientStage =
  | 'inquiry'
  | 'quoted'
  | 'booked'
  | 'shooting'
  | 'delivered'
  | 'paid'

export type ClientTier = 'standard' | 'vip' | 'returning'

export type ProjectType =
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

export interface ClientRecord {
  /** Unique identifier — email used as stable key when no DB id available */
  id: string
  email: string
  displayName: string
  phone?: string
  /** Primary shoot type for the most recent or upcoming project */
  shootType: string
  /** Most recent or upcoming shoot date in ISO format */
  shootDate?: string
  /** Formatted price string, e.g. "$2.5k" */
  price: string
  /** Pipeline stage */
  stage: ClientStage
  /** Client tier badge */
  tier?: ClientTier
  /** Total revenue from this client in cents */
  totalRevenueCents?: number
  /** Number of projects */
  projectCount?: number
  /** ISO date of last activity */
  lastActive?: string
  /** ISO date client was added */
  joinedAt?: string
  /** Project type for filtering */
  projectType?: ProjectType
  /** Notes (photographer-private) */
  notes?: string
}

export type ClientSortKey =
  | 'displayName'
  | 'stage'
  | 'shootDate'
  | 'price'
  | 'projectCount'
  | 'lastActive'

export type SortDirection = 'asc' | 'desc'

export type ClientView = 'kanban' | 'list'

export interface ClientFilters {
  search: string
  stage: ClientStage | 'all'
  projectType: ProjectType | 'all'
  /** ISO date range start */
  dateFrom?: string
  /** ISO date range end */
  dateTo?: string
}

export interface NewClientFormData {
  displayName: string
  email: string
  phone?: string
  shootType: string
  projectType: ProjectType
  stage: ClientStage
  price?: string
  notes?: string
}
