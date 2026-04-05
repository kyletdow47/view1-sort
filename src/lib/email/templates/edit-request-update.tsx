import React from 'react'

type EditRequestStatus = 'priced' | 'in_progress' | 'delivered'

interface EditRequestUpdateEmailProps {
  clientName: string
  photoTitle: string
  newStatus: EditRequestStatus
  price?: number
  approvalUrl?: string
  deliveryUrl?: string
}

const STATUS_CONFIG: Record<EditRequestStatus, { label: string; color: string }> = {
  priced: { label: 'Priced — Awaiting Your Approval', color: '#FBBF24' },
  in_progress: { label: 'In Progress', color: '#A78BFA' },
  delivered: { label: 'Delivered', color: '#34D399' },
}

export function EditRequestUpdateEmail({
  clientName,
  photoTitle,
  newStatus,
  price,
  approvalUrl,
  deliveryUrl,
}: EditRequestUpdateEmailProps) {
  const { label, color } = STATUS_CONFIG[newStatus]

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0D0B1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ backgroundColor: '#0D0B1A', padding: '40px 16px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style={{ maxWidth: '540px' }}>
                  <tbody>
                    <tr>
                      <td align="center" style={{ paddingBottom: '32px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>View1</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px', padding: '36px 32px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '15px', color: 'rgba(255,255,255,0.60)' }}>Hi {clientName},</p>
                        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                          Edit Request Update
                        </h1>
                        <p style={{ margin: '0 0 20px', fontSize: '15px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
                          Your edit request for <strong style={{ color: '#ffffff' }}>{photoTitle}</strong> has been updated.
                        </p>
                        {/* Status badge */}
                        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 18px', marginBottom: '24px' }}>
                          <span style={{ color, fontSize: '13px', fontWeight: 700 }}>{label}</span>
                        </div>

                        {/* Priced — show price + approval CTA */}
                        {newStatus === 'priced' && price !== undefined && approvalUrl && (
                          <>
                            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'rgba(255,255,255,0.60)' }}>
                              Price: <strong style={{ color: '#FBBF24', fontSize: '18px' }}>${price}</strong>
                            </p>
                            <table role="presentation" cellSpacing={0} cellPadding={0} style={{ marginBottom: '24px' }}>
                              <tbody>
                                <tr>
                                  <td style={{ borderRadius: '14px', background: 'linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#a855f7 100%)' }}>
                                    <a href={approvalUrl} style={{ display: 'block', padding: '14px 32px', fontSize: '15px', fontWeight: 700, color: '#ffffff', textDecoration: 'none', borderRadius: '14px' }}>
                                      Approve Edit →
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </>
                        )}

                        {/* Delivered — show view CTA */}
                        {newStatus === 'delivered' && deliveryUrl && (
                          <table role="presentation" cellSpacing={0} cellPadding={0} style={{ marginBottom: '24px' }}>
                            <tbody>
                              <tr>
                                <td style={{ borderRadius: '14px', background: 'linear-gradient(135deg,#34D399 0%,#059669 100%)' }}>
                                  <a href={deliveryUrl} style={{ display: 'block', padding: '14px 32px', fontSize: '15px', fontWeight: 700, color: '#ffffff', textDecoration: 'none', borderRadius: '14px' }}>
                                    View Delivered Edit →
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.30)', lineHeight: 1.6 }}>
                          Questions? Reply to this email to reach your photographer directly.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style={{ paddingTop: '24px' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.20)' }}>
                          Delivered securely by View1
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
