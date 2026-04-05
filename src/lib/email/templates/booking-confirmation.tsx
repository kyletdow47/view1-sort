import React from 'react'

interface BookingConfirmationEmailProps {
  clientName: string
  photographerName: string
  shootType: string
  shootDate: string
  location?: string
  packageDetails?: string
}

export function BookingConfirmationEmail({
  clientName,
  photographerName,
  shootType,
  shootDate,
  location,
  packageDetails,
}: BookingConfirmationEmailProps) {
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
                          Booking Confirmed ✓
                        </h1>
                        <p style={{ margin: '0 0 24px', fontSize: '15px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
                          Your session with <strong style={{ color: '#ffffff' }}>{photographerName}</strong> is all set.
                        </p>
                        {/* Details table */}
                        <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ marginBottom: '28px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', overflow: 'hidden' }}>
                          <tbody>
                            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Shoot Type</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#ffffff', textAlign: 'right' }}>{shootType}</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Date</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#34D399', textAlign: 'right' }}>{shootDate}</td>
                            </tr>
                            {location && (
                              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Location</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#ffffff', textAlign: 'right' }}>{location}</td>
                              </tr>
                            )}
                            {packageDetails && (
                              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Package</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#ffffff', textAlign: 'right' }}>{packageDetails}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
                          You will receive your gallery link via email once your photos are ready. Reply to this email with any questions.
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
