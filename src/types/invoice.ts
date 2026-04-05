// Invoice Creator types
// All monetary values stored in cents (integer) to avoid floating-point errors

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'stripe' | 'manual'
export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'AUD'
export type DiscountType = 'percentage' | 'fixed'

export interface InvoiceLineItemData {
  id: string
  description: string
  quantity: number
  unitPrice: number // in cents, e.g. 50000 = $500.00
}

export interface InvoiceClientRecord {
  id: string
  name: string
  email: string
  company?: string
}

export interface InvoiceProjectRecord {
  id: string
  name: string
  clientId: string
  date: string
}

export interface InvoiceFormData {
  clientId: string
  clientName: string
  clientEmail: string
  projectId: string | null
  projectName: string | null
  invoiceNumber: string
  issueDate: string // ISO date YYYY-MM-DD
  dueDate: string   // ISO date YYYY-MM-DD
  currency: CurrencyCode
  lineItems: InvoiceLineItemData[]
  taxEnabled: boolean
  taxRate: number        // percentage, e.g. 10 = 10%
  discountEnabled: boolean
  discountType: DiscountType
  discountValue: number  // if percentage: e.g. 5 = 5%; if fixed: cents e.g. 1000 = $10.00
  notes: string          // shown on invoice to client
  internalNotes: string  // photographer-only notes
  paymentMethod: PaymentMethod
  partialPaymentEnabled: boolean
  lateFeeEnabled: boolean
  lateFeePercent: number // e.g. 1.5 = 1.5% per month
  status: InvoiceStatus
}

export interface InvoiceCreatorProps {
  onClose: () => void
  onSaveDraft?: (invoice: InvoiceFormData) => Promise<void>
  onSend?: (invoice: InvoiceFormData) => Promise<void>
  initialData?: Partial<InvoiceFormData>
}
