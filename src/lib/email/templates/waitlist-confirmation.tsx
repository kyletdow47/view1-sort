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

/* Rainbow border colors for email-safe static gradient */
const RAINBOW = 'linear-gradient(135deg, #818cf8, #a78bfa, #34d399, #06b6d4, #fbbf24, #f87171, #818cf8)'
const RAINBOW_SUBTLE = 'linear-gradient(135deg, rgba(129,140,248,0.4), rgba(167,139,250,0.3), rgba(52,211,153,0.4), rgba(6,182,212,0.3), rgba(251,191,36,0.4), rgba(248,113,113,0.3), rgba(129,140,248,0.4))'

interface WaitlistConfirmationEmailProps {
  name?: string
  dashboardScreenshotUrl?: string
  calendarUrl?: string
  substackUrl?: string
  youtubeUrl?: string
}

export function WaitlistConfirmationEmail({
  name,
  dashboardScreenshotUrl = DASHBOARD_IMG,
  calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=View1+Sort+%E2%80%94+Demo+Day&dates=20260420T120000Z%2F20260420T130000Z&details=View1+Sort+demo+goes+live.+Get+early+access+at+view1sort.com&location=https%3A%2F%2Fview1sort.com',
  substackUrl = 'https://view1sort.substack.com/',
  youtubeUrl = 'https://www.youtube.com/@view1media',
}: WaitlistConfirmationEmailProps) {
  const greeting = name ? `${name}, you're in.` : "You're in."

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        `}</style>
      </Head>
      <Preview>You&apos;re on the list. View1 Sort demo goes live April 20.</Preview>
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
                <Text style={badgeIndigo}>Coming April 20</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Hero ── */}
          <Section style={heroZone}>
            <Text style={eyebrow}>EARLY ACCESS &middot; WAITLIST CONFIRMED</Text>
            <Heading style={heroH1}>{greeting}</Heading>
            <Heading as="h2" style={heroH1Sub}>Demo goes live April 20.</Heading>
            <Text style={heroP}>
              Most photographers spend 3+ hours after every shoot sorting, watermarking,
              invoicing, and chasing payment across 5 different apps. I built one place for all of it.
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

          {/* ── What's inside label ── */}
          <Section style={{ padding: '0 28px 12px' }}>
            <Text style={sectionLabel}>WHAT&apos;S INSIDE</Text>
          </Section>

          {/* ── 2x2 Feature cards ── */}
          <Section style={{ padding: '0 24px 28px' }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              {/* Row 1 */}
              <tr>
                <td width="50%" valign="top" style={{ paddingRight: '5px', paddingBottom: '10px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#818cf8' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#818cf8' }}>&#x2728;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>AI Story Sorting</Text>
                          <Text style={cardDesc}>Upload thousands of photos. The AI understands narrative, not just sharpness.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" valign="top" style={{ paddingLeft: '5px', paddingBottom: '10px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#34d399' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#34d399' }}>&#x1F5BC;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Gallery Delivery</Text>
                          <Text style={cardDesc}>Watermarked previews, client selection, final downloads. One link.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td width="50%" valign="top" style={{ paddingRight: '5px' }}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr><td style={{ ...cardBorder, borderColor: '#fbbf24' }}>
                      <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                        <tr><td style={cardInner}>
                          <table cellPadding="0" cellSpacing="0" role="presentation">
                            <tr><td style={{ ...iconBox, backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' }}>
                              <Text style={{ ...iconEmoji, color: '#fbbf24' }}>&#x1F4C4;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Contracts &amp; Invoicing</Text>
                          <Text style={cardDesc}>Send, sign, and get paid without leaving the app.</Text>
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
                              <Text style={{ ...iconEmoji, color: '#f87171' }}>&#x1F4C5;</Text>
                            </td></tr>
                          </table>
                          <Text style={cardTitle}>Booking &amp; CRM</Text>
                          <Text style={cardDesc}>Calendar, client profiles, project tracking. All connected.</Text>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── CTA buttons ── */}
          <Section style={{ padding: '0 32px 12px', textAlign: 'center' as const }}>
            <Link href={calendarUrl} style={ctaPrimary}>
              Add April 20 to Calendar
            </Link>
          </Section>
          <Section style={{ padding: '0 32px 8px', textAlign: 'center' as const }}>
            <Link href={substackUrl} style={ctaGlass}>
              Read weekly updates on Substack
            </Link>
          </Section>
          <Section style={{ padding: '0 32px 28px', textAlign: 'center' as const }}>
            <Link href={youtubeUrl} style={ctaGlass}>
              Watch build progress on YouTube
            </Link>
          </Section>

          {/* ── Rainbow divider ── */}
          <Section style={rainbowDivider} />

          {/* ── Social icons ── */}
          <Section style={{ padding: '24px 32px', textAlign: 'center' as const }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" align="center">
              <tr>
                <td style={{ ...socialIcon, borderColor: '#818cf8' }}><Link href="https://www.instagram.com/view1sort/" style={socialLinkStyle}>IG</Link></td>
                <td width="12" />
                <td style={{ ...socialIcon, borderColor: '#a78bfa' }}><Link href="https://x.com/Kyletdow" style={socialLinkStyle}>X</Link></td>
                <td width="12" />
                <td style={{ ...socialIcon, borderColor: '#34d399' }}><Link href="https://www.linkedin.com/in/kyledow-ai/" style={socialLinkStyle}>in</Link></td>
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
            </Text>
            <Link href="#" style={unsubLink}>Unsubscribe</Link>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

/* ════════════════════════════════════════════
   STYLES — Zinc palette, rainbow accents
════════════════════════════════════════════ */

const main: React.CSSProperties = {
  backgroundColor: '#0d0e14',
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
  backgroundColor: '#0d0e14',
}

const rainbowEdge: React.CSSProperties = {
  height: '3px',
  background: RAINBOW,
}

const header: React.CSSProperties = {
  padding: '28px 32px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const logoIcon: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  textAlign: 'center',
  verticalAlign: 'middle',
}

const logoIconText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: 800,
  margin: 0,
  lineHeight: '32px',
}

const logoTextStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '-0.3px',
}

const badgeIndigo: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 600,
  color: '#A5B4FC',
  backgroundColor: 'rgba(79,70,229,0.12)',
  border: '1px solid rgba(79,70,229,0.25)',
  borderRadius: '999px',
  padding: '5px 14px',
  margin: 0,
  letterSpacing: '0.02em',
}

const heroZone: React.CSSProperties = {
  padding: '40px 32px 8px',
  textAlign: 'center',
}

const eyebrow: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'rgba(165,180,252,0.5)',
  margin: '0 0 20px',
}

const heroH1: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 800,
  letterSpacing: '-1.2px',
  lineHeight: '1.1',
  color: '#ffffff',
  margin: '0 0 4px',
}

const heroH1Sub: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 800,
  letterSpacing: '-1.2px',
  lineHeight: '1.1',
  color: '#818cf8',
  margin: '0 0 20px',
}

const heroP: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: 'rgba(224,231,255,0.45)',
  margin: '0 auto 8px',
  maxWidth: '400px',
}

/* Screenshot with rainbow border */
const screenshotBorder: React.CSSProperties = {
  padding: '2px',
  borderRadius: '14px',
  background: RAINBOW,
}

const screenshotImg: React.CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: '516px',
  borderRadius: '12px',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'rgba(165,180,252,0.4)',
  margin: '0',
}

/* Feature cards */
const cardBorder: React.CSSProperties = {
  border: '1px solid',
  borderRadius: '14px',
  backgroundColor: 'rgba(255,255,255,0.03)',
}

const cardInner: React.CSSProperties = {
  padding: '18px 16px',
}

const iconBox: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '9px',
  border: '1px solid',
  textAlign: 'center',
  verticalAlign: 'middle',
}

const iconEmoji: React.CSSProperties = {
  fontSize: '15px',
  margin: 0,
  lineHeight: '34px',
}

const cardTitle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.9)',
  margin: '10px 0 6px',
  letterSpacing: '-0.01em',
}

const cardDesc: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '1.55',
  color: 'rgba(224,231,255,0.38)',
  margin: 0,
}

/* CTA buttons */
const ctaPrimary: React.CSSProperties = {
  display: 'inline-block',
  padding: '18px 40px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 700,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
}

const ctaGlass: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'rgba(224,231,255,0.7)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  textDecoration: 'none',
}

/* Rainbow divider */
const rainbowDivider: React.CSSProperties = {
  height: '1px',
  margin: '0 32px',
  background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, #34d399, #06b6d4, #fbbf24, #f87171, transparent)',
  opacity: 0.4,
}

/* Social icons with colored borders */
const socialIcon: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid',
  textAlign: 'center',
  verticalAlign: 'middle',
}

const socialLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  lineHeight: '44px',
}

const footer: React.CSSProperties = {
  padding: '24px 32px 32px',
}

const signoff: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(224,231,255,0.45)',
  margin: '0',
}

const signoffSub: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(224,231,255,0.3)',
  margin: '0 0 16px',
}

const footerNote: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(224,231,255,0.15)',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const unsubLink: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(165,180,252,0.35)',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
}
