/**
 * Calendar types for the View1 Sort /dashboard/calendar page.
 * Events are sourced from bookings (BookingRecord) and projects (shoot_date).
 */

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list'

/** Unified event status — combines booking stages + 10-stage project enum */
export type CalendarEventStatus =
  | 'inquiry'
  | 'quoted'
  | 'booked'
  | 'contracted'
  | 'prepped'
  | 'shooting'
  | 'processing'
  | 'review'
  | 'gallery_live'
  | 'delivered'
  | 'paid'
  | 'blocked' // blocked time slot

export type CalendarEventSourceType = 'booking' | 'project' | 'block'

export interface CalendarEvent {
  /** Unique identifier */
  id: string
  /** Display title (client name or event name) */
  title: string
  /** Subtitle (shoot type, project name, etc.) */
  subtitle?: string
  /** ISO date: YYYY-MM-DD */
  date: string
  /** 24-hour time string: HH:MM */
  timeStart?: string
  /** 24-hour time string: HH:MM */
  timeEnd?: string
  /** Source: booking, project, or blocked slot */
  sourceType: CalendarEventSourceType
  /** Stage/status for colour coding */
  status: CalendarEventStatus
  /** Optional location */
  location?: string
  /** Optional notes */
  notes?: string
  /** Link back to booking */
  bookingId?: string
  /** Link back to project */
  projectId?: string
  /** Whether this is an all-day event */
  allDay?: boolean
}

export interface CreateEventFormData {
  title: string
  subtitle?: string
  date: string
  timeStart?: string
  timeEnd?: string
  sourceType: CalendarEventSourceType
  status: CalendarEventStatus
  location?: string
  notes?: string
  allDay: boolean
}

export interface CalendarFilters {
  status: CalendarEventStatus | 'all'
  sourceType: CalendarEventSourceType | 'all'
  search: string
}
