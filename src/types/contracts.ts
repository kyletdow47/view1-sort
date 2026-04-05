/**
 * Contracts & Documents types for View1 Sort.
 * Covers contracts, templates, and questionnaires.
 *
 * HelloSign (Dropbox Sign) integration is stubbed.
 * TODO(hellosign): Replace stub send/sign flows with HelloSign API calls once
 *   HELLOSIGN_API_KEY is configured in env and the hellosign-sdk package is installed.
 */

// ─────────────────────────────────────────────────────────────
//  Contracts
// ─────────────────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired'

export type ContractCategory =
  | 'Wedding'
  | 'Engagement'
  | 'Portrait'
  | 'Family'
  | 'Commercial'
  | 'Branding'
  | 'Event'
  | 'Other'

export interface ContractRecord {
  id: string
  projectName: string
  clientName: string
  clientEmail: string
  /** Category / shoot type */
  category: ContractCategory
  /** Human-readable contract type label, e.g. "Wedding Photography Contract" */
  type: string
  status: ContractStatus
  /** ISO date string or formatted display string */
  eventDate: string | null
  /** Total contract value in cents */
  valueInCents: number | null
  sentDate: string | null
  signedDate: string | null
  createdAt: string
  body: string
  /** HelloSign signature request ID — null until sent via HelloSign */
  helloSignRequestId: string | null
}

// ─────────────────────────────────────────────────────────────
//  Templates
// ─────────────────────────────────────────────────────────────

export interface ContractTemplate {
  id: string
  name: string
  category: ContractCategory
  body: string
  variableHints: string[]
  lastUsedAt: string | null
  createdAt: string
}

// ─────────────────────────────────────────────────────────────
//  Questionnaires
// ─────────────────────────────────────────────────────────────

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'signature'

export interface QuestionnaireField {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface QuestionnaireRecord {
  id: string
  name: string
  category: ContractCategory
  fields: QuestionnaireField[]
  responseCount: number
  createdAt: string
  lastSentAt: string | null
}

// ─────────────────────────────────────────────────────────────
//  UI state helpers
// ─────────────────────────────────────────────────────────────

export type ContractTab = 'Contracts' | 'Templates' | 'Questionnaires'

export type ContractFilter = 'all' | 'sent' | 'signed' | 'draft' | 'expired'
