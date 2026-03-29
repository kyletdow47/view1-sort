import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import type { EmailStatus } from '@/types/supabase'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      throw new Error('Missing RESEND_API_KEY environment variable')
    }
    _resend = new Resend(key)
  }
  return _resend
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'View1 Sort <noreply@view1.studio>'

export interface SendEmailOptions {
  to: string
  subject: string
  template: string
  react: React.ReactElement
  userId?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const { to, subject, template, react, userId } = options
  const resend = getResend()

  let status: EmailStatus = 'sent'
  let resendId: string | null = null
  let errorMessage: string | null = null

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      react,
    })

    if (error) {
      status = 'failed'
      errorMessage = error.message
      throw new Error(`Resend error: ${error.message}`)
    }

    resendId = data?.id ?? null
    status = 'sent'

    return { id: resendId ?? '' }
  } catch (err) {
    if (status !== 'failed') {
      status = 'failed'
      errorMessage = err instanceof Error ? err.message : 'Unknown error'
    }
    throw err
  } finally {
    // Log email to database (non-blocking)
    logEmail({ to, subject, template, status, resendId, userId, errorMessage }).catch(
      (logErr) => console.error('Failed to log email:', logErr)
    )
  }
}

async function logEmail(params: {
  to: string
  subject: string
  template: string
  status: EmailStatus
  resendId: string | null
  userId?: string
  errorMessage: string | null
}): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('email_logs').insert({
    to_email: params.to,
    template: params.template,
    subject: params.subject,
    status: params.status,
    metadata: {
      resend_id: params.resendId,
      user_id: params.userId,
      error: params.errorMessage,
    },
  })
}
