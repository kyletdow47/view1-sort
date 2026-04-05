import React from 'react'

interface ContractSentEmailProps {
  clientName: string
  photographerName: string
  contractTitle: string
  signingUrl: string
}

export function ContractSentEmail({
  clientName,
  photographerName,
  contractTitle,
  signingUrl,
}: ContractSentEmailProps) {
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
                    {/* Header */}
                    <tr>
                      <td align="center" style={{ paddingBottom: '32px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>View1</span>
                      </td>
                    </tr>
                    {/* Card */}
                    <tr>
                      <td style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px', padding: '36px 32px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '15px', color: 'rgba(255,255,255,0.60)' }}>Hi {clientName},</p>
                        <h1 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                          Contract Ready to Sign
                        </h1>
                        <p style={{ margin: '0 0 8px', fontSize: '15px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
                          <strong style={{ color: '#ffffff' }}>{photographerName}</strong> has sent you a contract to review and sign:
                        </p>
                        <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#A78BFA', fontWeight: 600 }}>{contractTitle}</p>
                        {/* CTA */}
                        <table role="presentation" cellSpacing={0} cellPadding={0} style={{ marginBottom: '28px' }}>
                          <tbody>
                            <tr>
                              <td style={{ borderRadius: '14px', background: 'linear-gradient(135deg,#A78BFA 0%,#8B5CF6 100%)' }}>
                                <a href={signingUrl} style={{ display: 'block', padding: '14px 32px', fontSize: '15px', fontWeight: 700, color: '#ffffff', textDecoration: 'none', borderRadius: '14px' }}>
                                  Review &amp; Sign Contract →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                          This link is unique to you. The contract is locked once all parties sign.
                        </p>
                      </td>
                    </tr>
                    {/* Footer */}
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
