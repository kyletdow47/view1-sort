import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendForSignature } from '@/lib/hellosign'

interface SendContractBody {
  contractId: string
  clientEmail: string
  clientName: string
  /** Public URL to the PDF contract */
  fileUrl: string
  title?: string
  message?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as SendContractBody
    const { contractId, clientEmail, clientName, fileUrl, title, message } = body

    if (!contractId || !clientEmail || !clientName || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch photographer profile for the signing message
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    const photographerName = (profile?.business_name as string | null) ?? (profile?.full_name as string | null) ?? 'Your photographer'

    const signatureRequest = await sendForSignature({
      title: title ?? 'Photography Services Agreement',
      subject: title ?? 'Please sign your photography contract',
      message: message ?? `Hi ${clientName}, please review and sign your contract with ${photographerName}.`,
      signers: [
        { email_address: clientEmail, name: clientName, order: 0 },
      ],
      fileUrl,
      metadata: {
        contractId,
        photographerId: user.id,
      },
      signingRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign/complete`,
    })

    // Store the signature request ID on the contract record
    await supabase
      .from('contracts')
      .update({
        signature_request_id: signatureRequest.signature_request_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .eq('photographer_id', user.id)

    return NextResponse.json({
      signatureRequestId: signatureRequest.signature_request_id,
      signingUrl: signatureRequest.signing_url,
    })
  } catch (err) {
    console.error('[contracts/send]', err)
    return NextResponse.json({ error: 'Failed to send contract for signature' }, { status: 500 })
  }
}
