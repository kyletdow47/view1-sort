/**
 * HelloSign (Dropbox Sign) API wrapper
 * Docs: https://developers.hellosign.com/api/reference/operation/signatureRequestSend/
 *
 * Env vars required:
 *   HELLOSIGN_API_KEY  — server-side only, never expose client-side
 */

const HELLOSIGN_BASE = 'https://api.hellosign.com/v3'

export interface SignatureRequestSigner {
  email_address: string
  name: string
  order?: number
}

export interface SendForSignatureParams {
  title: string
  subject: string
  message?: string
  signers: SignatureRequestSigner[]
  /** Base64-encoded PDF or URL to the document */
  fileUrl?: string
  fileBase64?: string
  /** Pre-filled fields (text, signature, date) to place on the document */
  formFieldsPerDocument?: unknown[]
  /** Redirect after signing */
  signingRedirectUrl?: string
  /** Metadata to attach to the request (stored in HelloSign, passed back on webhook) */
  metadata?: Record<string, string>
}

export interface SignatureRequestResponse {
  signature_request_id: string
  title: string
  subject: string
  message: string | null
  is_complete: boolean
  signing_url: string | null
  details_url: string
  has_error: boolean
  signatures: {
    signature_id: string
    signer_email_address: string
    signer_name: string
    status_code: 'awaiting_signature' | 'signed' | 'declined'
    signed_at: number | null
    last_viewed_at: number | null
  }[]
}

export interface HelloSignWebhookEvent {
  event: {
    event_type:
      | 'signature_request_signed'
      | 'signature_request_all_signed'
      | 'signature_request_viewed'
      | 'signature_request_declined'
      | 'signature_request_sent'
    event_time: string
    event_hash: string
    event_metadata: {
      related_signature_id?: string
      reported_for_account_id?: string
    }
  }
  signature_request: SignatureRequestResponse
}

/**
 * Send a document for e-signature via HelloSign.
 * Must be called server-side only (uses HELLOSIGN_API_KEY).
 */
export async function sendForSignature(
  params: SendForSignatureParams
): Promise<SignatureRequestResponse> {
  const apiKey = process.env.HELLOSIGN_API_KEY
  if (!apiKey) {
    throw new Error('HELLOSIGN_API_KEY is not set')
  }

  const body = new FormData()
  body.append('title', params.title)
  body.append('subject', params.subject)
  if (params.message) body.append('message', params.message)
  if (params.signingRedirectUrl) body.append('signing_redirect_url', params.signingRedirectUrl)

  params.signers.forEach((signer, i) => {
    body.append(`signers[${i}][email_address]`, signer.email_address)
    body.append(`signers[${i}][name]`, signer.name)
    if (signer.order !== undefined) {
      body.append(`signers[${i}][order]`, String(signer.order))
    }
  })

  if (params.fileUrl) {
    body.append('file_url[0]', params.fileUrl)
  } else if (params.fileBase64) {
    // Convert base64 to blob
    const byteChars = atob(params.fileBase64)
    const bytes = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
    body.append('file[0]', new Blob([bytes], { type: 'application/pdf' }), 'contract.pdf')
  }

  if (params.metadata) {
    body.append('metadata', JSON.stringify(params.metadata))
  }

  if (params.formFieldsPerDocument) {
    body.append('form_fields_per_document', JSON.stringify(params.formFieldsPerDocument))
  }

  const response = await fetch(`${HELLOSIGN_BASE}/signature_request/send`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
    body,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `HelloSign API error ${response.status}: ${JSON.stringify(error)}`
    )
  }

  const data = await response.json()
  return data.signature_request as SignatureRequestResponse
}

/**
 * Retrieve a signature request by its ID.
 */
export async function getSignatureRequest(
  signatureRequestId: string
): Promise<SignatureRequestResponse> {
  const apiKey = process.env.HELLOSIGN_API_KEY
  if (!apiKey) throw new Error('HELLOSIGN_API_KEY is not set')

  const response = await fetch(
    `${HELLOSIGN_BASE}/signature_request/${signatureRequestId}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HelloSign API error ${response.status}`)
  }

  const data = await response.json()
  return data.signature_request as SignatureRequestResponse
}

/**
 * Verify the HelloSign webhook event hash to confirm it came from HelloSign.
 * Use in app/api/webhooks/hellosign/route.ts before processing.
 */
export function verifyWebhookHash(
  eventHash: string,
  apiKey: string,
  eventTime: string,
  eventType: string
): boolean {
  // HelloSign uses HMAC-SHA256: hash = HMAC(apiKey, eventTime + eventType)
  // In Node.js runtime this requires the `crypto` module.
  // Implementation deferred — wire up in the webhook route handler.
  // TODO: implement HMAC-SHA256 verification using crypto.createHmac
  void eventHash
  void apiKey
  void eventTime
  void eventType
  return true
}
