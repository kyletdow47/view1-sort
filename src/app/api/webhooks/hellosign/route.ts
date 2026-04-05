import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { HelloSignWebhookEvent } from '@/lib/hellosign'

/**
 * HelloSign webhook handler.
 * Configure in HelloSign dashboard: POST {APP_URL}/api/webhooks/hellosign
 */
export async function POST(request: Request) {
  try {
    // HelloSign sends webhook data as JSON in the body
    const text = await request.text()

    let payload: HelloSignWebhookEvent
    try {
      // HelloSign wraps the payload as JSON in a 'json' form field sometimes;
      // try both formats.
      const raw = JSON.parse(text) as unknown
      if (raw && typeof raw === 'object' && 'json' in raw) {
        payload = JSON.parse((raw as { json: string }).json) as HelloSignWebhookEvent
      } else {
        payload = raw as HelloSignWebhookEvent
      }
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { event, signature_request } = payload

    // Respond immediately to prevent HelloSign from retrying
    // (we process asynchronously below)
    const supabase = await createClient()

    const signatureRequestId = signature_request.signature_request_id
    const contractMetadata = signature_request.signatures?.[0]

    switch (event.event_type) {
      case 'signature_request_viewed':
        await supabase
          .from('contracts')
          .update({ last_viewed_at: new Date(parseInt(event.event_time) * 1000).toISOString() })
          .eq('signature_request_id', signatureRequestId)
        break

      case 'signature_request_signed': {
        // One signer has signed — update the individual signature record
        const signerId = contractMetadata?.signature_id
        if (signerId) {
          await supabase
            .from('contract_signatures')
            .update({ status: 'signed', signed_at: new Date().toISOString() })
            .eq('hellosign_signature_id', signerId)
        }
        break
      }

      case 'signature_request_all_signed':
        await supabase
          .from('contracts')
          .update({
            status: 'signed',
            completed_at: new Date().toISOString(),
            is_complete: true,
          })
          .eq('signature_request_id', signatureRequestId)
        break

      case 'signature_request_declined':
        await supabase
          .from('contracts')
          .update({ status: 'declined' })
          .eq('signature_request_id', signatureRequestId)
        break

      default:
        // Unknown event — log and ignore
        console.info('[hellosign webhook] unhandled event:', event.event_type)
    }

    // HelloSign expects the literal string "Hello API Event Received" as the response
    return new Response('Hello API Event Received', { status: 200 })
  } catch (err) {
    console.error('[webhooks/hellosign]', err)
    // Still return 200 to prevent HelloSign from flooding retries
    return new Response('Hello API Event Received', { status: 200 })
  }
}
