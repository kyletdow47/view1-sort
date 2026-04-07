import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

const DASHBOARD_IMG = 'https://view1sort.com/designs/view1-dashboard.png'
const RAINBOW = 'linear-gradient(135deg, #818cf8, #a78bfa, #34d399, #06b6d4, #fbbf24, #f87171, #818cf8)'

interface WaitlistLaunchEmailProps {
  name?: string
  dashboardScreenshotUrl?: string
  accessUrl: string
  substackUrl?: string
  youtubeUrl?: string
}

export function WaitlistLaunchEmail({
  name,
  dashboardScreenshotUrl = DASHBOARD_IMG,
  accessUrl,
  substackUrl = '#',
  youtubeUrl = '#',
}: WaitlistLaunchEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        `}</style>
      </Head>
      <Preview>April 20 is here. Your early access link to View1 Sort is inside.</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Rainbow top edge ── */}
          <Section style={rainbowEdge} />

          {/* ── Logo header ── */}
          <Section style={header}>
            <Row>
              <Column>
                <table cellPadding="0" cellSpacing="0" role="presentation">
                  <tr>
                    <td style={logoIcon}>
                      <Text style={logoIconText}>V1</Text>
                    </td>
                    <td style={{ paddingLeft: '10px' }}>
                      <Text style={logoTextStyle}>View1 Sort</Text>
                    </td>
                  </tr>
                </table>
              </Column>
              <Column align="right">
                <Text style={badgeGreen}>Live now</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Hero ── */}
          <Section style={heroZone}>
            <Text style={eyebrow}>APRIL 20, 2026 &middot; DEMO LAUNCH</Text>
            <Heading style={heroH1}>It&apos;s live.</Heading>
            <Heading as="h2" style={heroH1Green}>Your link is ready.</Heading>
            <Text style={heroP}>
              You signed up early. You&apos;re in the first group.
              Create your account and start sorting.
            </Text>
          </Section>

          {/* ── Dashboard screenshot with rainbow border ── */}
          <Section style={{ padding: '0 20px 32px', textAlign: 'center' as const }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" align="center" style={{ margin: '0 auto' }}>
              <tr>
                <td style={screenshotBorder}>
                  <Img
                    src={dashboardScreenshotUrl}
                    alt="View1 Sort Dashboard"
                    width="516"
                    style={screenshotImg}
                  />
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Access box with green rainbow border ── */}
          <Section style={{ padding: '0 20px 24px' }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              <tr>
                <td style={accessBorder}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr>
                      <td style={accessInner}>
                        <Text style={accessLabel}>YOUR EARLY ACCESS LINK</Text>
                        <table cellPadding="0" cellSpacing="0" role="presentation" align="center" style={{ margin: '0 auto' }}>
                          <tr><td align="center">
                            <Link href={accessUrl} style={ctaGreen}>
                              Start Using View1 Sort &rarr;
                            </Link>
                          </td></tr>
                        </table>
                        <Text style={accessNote}>
                          Create your account, set your password, and you&apos;re in.
                          <br />
                          Early access members get a lifetime discount on Pro.
                        </Text>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── What you can do today ── */}
          <Section style={{ padding: '0 28px 12px' }}>
            <Text style={sectionLabelGreen}>WHAT YOU CAN DO TODAY</Text>
          </Section>

          {/* ── 2x2 Feature cards ── */}
          <Section style={{ padding: '0 24px 28px' }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              <tr>
                <td width="50%" valign="top" style={{ paddingRight: '5px', paddingBottom: '10px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#34d399' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#34d399' }}>&#x1F4E4;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Upload a shoot</Text>
                          <Text style={cardDesc}>Drag and drop up to 5,000 photos at once.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" valign="top" style={{ paddingLeft: '5px', paddingBottom: '10px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#818cf8' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#818cf8' }}>&#x2728;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Watch AI sort it</Text>
                          <Text style={cardDesc}>The AI reads the narrative arc, not just sharpness.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td width="50%" valign="top" style={{ paddingRight: '5px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#fbbf24' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#fbbf24' }}>&#x1F5BC;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Send a gallery</Text>
                          <Text style={cardDesc}>Watermarked preview with one-click client delivery.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" valign="top" style={{ paddingLeft: '5px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#f87171' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#f87171' }}>&#x1F4B0;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Get paid</Text>
                          <Text style={cardDesc}>Invoice, collect payment, and release downloads. One flow.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Secondary CTAs ── */}
          <Section style={{ padding: '0 32px 8px', textAlign: 'center' as const }}>
            <Link href={substackUrl} style={ctaGlass}>Read the launch story on Substack</Link>
          </Section>
          <Section style={{ padding: '0 32px 28px', textAlign: 'center' as const }}>
            <Link href={youtubeUrl} style={ctaGlass}>Watch the launch video on YouTube</Link>
          </Section>

          {/* ── Rainbow divider ── */}
          <Section style={rainbowDivider} />

          {/* ── Social icons ── */}
          <Section style={{ padding: '24px 32px', textAlign: 'center' as const }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" align="center">
              <tr>
                <td style={{ ...socialIcon, borderColor: '#818cf8' }}><Link href="#" style={socialLinkStyle}>IG</Link></td>
                <td width="12" />
                <td style={{ ...socialIcon, borderColor: '#a78bfa' }}><Link href="#" style={socialLinkStyle}>X</Link></td>
                <td width="12" />
                <td style={{ ...socialIcon, borderColor: '#34d399' }}><Link href="#" style={socialLinkStyle}>YT</Link></td>
                <td width="12" />
                <td style={{ ...socialIcon, borderColor: '#fbbf24' }}><Link href="#" style={socialLinkStyle}>TT</Link></td>
              </tr>
            </table>
          </Section>

          {/* ── Footer ── */}
          <Section style={rainbowDivider} />
          <Section style={footer}>
            <Text style={signoff}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Kyle</strong></Text>
            <Text style={signoffSub}>Founder, View1 Sort</Text>
            <Text style={footerNote}>
              You&apos;re receiving this because you joined the View1 Sort waitlist at view1sort.com.
              You&apos;re one of the first to get access.
            </Text>
            <Link href="#" style={unsubLink}>Unsubscribe</Link>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

/* ════════════════════════════════════════════ */

const main: React.CSSProperties = {
  backgroundColor: '#0d0e14',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0, padding: 0,
}
const container: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', padding: '0', backgroundColor: '#0d0e14' }
const rainbowEdge: React.CSSProperties = { height: '3px', background: RAINBOW }
const header: React.CSSProperties = { padding: '28px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }
const logoIcon: React.CSSProperties = { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', textAlign: 'center', verticalAlign: 'middle' }
const logoIconText: React.CSSProperties = { color: '#ffffff', fontSize: '11px', fontWeight: 800, margin: 0, lineHeight: '32px' }
const logoTextStyle: React.CSSProperties = { color: '#ffffff', fontSize: '16px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }
const badgeGreen: React.CSSProperties = { display: 'inline-block', fontSize: '10px', fontWeight: 600, color: '#34d399', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '999px', padding: '5px 14px', margin: 0 }
const heroZone: React.CSSProperties = { padding: '40px 32px 8px', textAlign: 'center' }
const eyebrow: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(52,211,153,0.5)', margin: '0 0 20px' }
const heroH1: React.CSSProperties = { fontSize: '36px', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: '1.1', color: '#ffffff', margin: '0 0 4px' }
const heroH1Green: React.CSSProperties = { fontSize: '36px', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: '1.1', color: '#34d399', margin: '0 0 20px' }
const heroP: React.CSSProperties = { fontSize: '15px', lineHeight: '1.7', color: 'rgba(224,231,255,0.45)', margin: '0 auto 8px', maxWidth: '400px' }

const screenshotBorder: React.CSSProperties = { padding: '2px', borderRadius: '14px', background: RAINBOW }
const screenshotImg: React.CSSProperties = { display: 'block', width: '100%', maxWidth: '516px', borderRadius: '12px' }

const accessBorder: React.CSSProperties = { padding: '2px', borderRadius: '18px', background: 'linear-gradient(135deg, #34d399, #06b6d4, #818cf8, #a78bfa, #34d399)' }
const accessInner: React.CSSProperties = { backgroundColor: '#0d0e14', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }
const accessLabel: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#34d399', margin: '0 0 18px' }
const accessNote: React.CSSProperties = { fontSize: '12px', color: 'rgba(224,231,255,0.3)', margin: '14px 0 0', lineHeight: '1.5' }

const ctaGreen: React.CSSProperties = {
  display: 'inline-block', padding: '20px 44px', borderRadius: '12px', fontSize: '17px', fontWeight: 700,
  color: '#ffffff', background: 'linear-gradient(135deg, #059669, #10b981, #34d399)', textDecoration: 'none',
  boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
}
const ctaGlass: React.CSSProperties = { display: 'inline-block', padding: '12px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'rgba(224,231,255,0.6)', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }

const sectionLabelGreen: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(52,211,153,0.5)', margin: '0' }

const cardBorder: React.CSSProperties = { border: '1px solid', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.03)' }
const cardInner: React.CSSProperties = { padding: '18px 16px' }
const iconBox: React.CSSProperties = { width: '34px', height: '34px', borderRadius: '9px', border: '1px solid', textAlign: 'center', verticalAlign: 'middle' }
const iconEmoji: React.CSSProperties = { fontSize: '15px', margin: 0, lineHeight: '34px' }
const cardTitle: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '10px 0 6px', letterSpacing: '-0.01em' }
const cardDesc: React.CSSProperties = { fontSize: '11px', lineHeight: '1.55', color: 'rgba(224,231,255,0.38)', margin: 0 }

const rainbowDivider: React.CSSProperties = { height: '1px', margin: '0 32px', background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, #34d399, #06b6d4, #fbbf24, #f87171, transparent)', opacity: 0.4 }
const socialIcon: React.CSSProperties = { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid', textAlign: 'center', verticalAlign: 'middle' }
const socialLinkStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textDecoration: 'none', lineHeight: '44px' }

const footer: React.CSSProperties = { padding: '24px 32px 32px' }
const signoff: React.CSSProperties = { fontSize: '14px', color: 'rgba(224,231,255,0.45)', margin: '0' }
const signoffSub: React.CSSProperties = { fontSize: '13px', color: 'rgba(224,231,255,0.3)', margin: '0 0 16px' }
const footerNote: React.CSSProperties = { fontSize: '11px', color: 'rgba(224,231,255,0.15)', lineHeight: '1.5', margin: '0 0 8px' }
const unsubLink: React.CSSProperties = { fontSize: '11px', color: 'rgba(165,180,252,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }
