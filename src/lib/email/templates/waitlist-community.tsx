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

interface WaitlistCommunityEmailProps {
  name?: string
  dashboardScreenshotUrl?: string
  substackUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
}

export function WaitlistCommunityEmail({
  name,
  dashboardScreenshotUrl = DASHBOARD_IMG,
  substackUrl = '#',
  youtubeUrl = '#',
  instagramUrl = '#',
}: WaitlistCommunityEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        `}</style>
      </Head>
      <Preview>184 commits. 11 days. The community is open — come build with us.</Preview>
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
                <Text style={badgeAmber}>Build update</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Hero ── */}
          <Section style={heroZone}>
            <Text style={eyebrow}>DAY 3 &middot; BUILD PROGRESS</Text>
            <Heading style={heroH1}>184 commits.</Heading>
            <Heading as="h2" style={heroH1Amber}>11 days.</Heading>
            <Text style={heroP}>
              Not a side project. A full sprint. Here&apos;s what&apos;s actually working — and where to follow along.
            </Text>
          </Section>

          {/* ── Stats row with colored borders ── */}
          <Section style={{ padding: '0 32px 24px', textAlign: 'center' as const }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" align="center">
              <tr>
                <td style={{ ...statPill, borderColor: '#818cf8' }}>
                  <Text style={statNum}>184</Text>
                  <Text style={statText}>commits pushed</Text>
                </td>
                <td width="10" />
                <td style={{ ...statPill, borderColor: '#34d399' }}>
                  <Text style={statNum}>6</Text>
                  <Text style={statText}>features shipped</Text>
                </td>
                <td width="10" />
                <td style={{ ...statPill, borderColor: '#fbbf24' }}>
                  <Text style={statNum}>13</Text>
                  <Text style={statText}>days until launch</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Dashboard screenshot with rainbow border ── */}
          <Section style={{ padding: '0 20px 32px', textAlign: 'center' as const }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" align="center" style={{ margin: '0 auto' }}>
              <tr>
                <td style={screenshotBorder}>
                  <Img
                    src={dashboardScreenshotUrl}
                    alt="View1 Sort Dashboard — work in progress"
                    width="516"
                    style={screenshotImg}
                  />
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Community box with amber border ── */}
          <Section style={{ padding: '0 20px 24px' }}>
            <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              <tr>
                <td style={communityBorder}>
                  <table cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tr>
                      <td style={communityInner}>
                        <Text style={communityLabel}>JOIN THE COMMUNITY</Text>
                        <Text style={communityText}>
                          I&apos;m building View1 Sort in public. Follow on Substack for deep-dives,
                          YouTube for live builds, and Instagram for daily progress.
                        </Text>
                        <table cellPadding="0" cellSpacing="0" role="presentation" align="center" style={{ margin: '0 auto' }}>
                          <tr><td align="center" style={{ paddingBottom: '8px' }}>
                            <Link href={substackUrl} style={ctaAmber}>Read the build on Substack</Link>
                          </td></tr>
                          <tr><td align="center" style={{ paddingBottom: '8px' }}>
                            <Link href={youtubeUrl} style={ctaGlass}>Watch progress on YouTube</Link>
                          </td></tr>
                          <tr><td align="center">
                            <Link href={instagramUrl} style={ctaGlass}>Follow on Instagram</Link>
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Rainbow divider ── */}
          <Section style={rainbowDivider} />

          {/* ── Social icons ── */}
          <Section style={{ padding: '24px 32px', textAlign: 'center' as const }}>
            <Text style={socialLabel}>ALSO HERE</Text>
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
const badgeAmber: React.CSSProperties = { display: 'inline-block', fontSize: '10px', fontWeight: 600, color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '999px', padding: '5px 14px', margin: 0 }
const heroZone: React.CSSProperties = { padding: '40px 32px 8px', textAlign: 'center' }
const eyebrow: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(251,191,36,0.5)', margin: '0 0 20px' }
const heroH1: React.CSSProperties = { fontSize: '34px', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: '1.1', color: '#ffffff', margin: '0 0 4px' }
const heroH1Amber: React.CSSProperties = { fontSize: '34px', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: '1.1', color: '#fbbf24', margin: '0 0 20px' }
const heroP: React.CSSProperties = { fontSize: '15px', lineHeight: '1.7', color: 'rgba(224,231,255,0.45)', margin: '0 auto 8px', maxWidth: '400px' }

const statPill: React.CSSProperties = { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: '12px', padding: '12px 18px', textAlign: 'center' }
const statNum: React.CSSProperties = { fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '0 0 2px', letterSpacing: '-0.5px' }
const statText: React.CSSProperties = { fontSize: '10px', color: 'rgba(224,231,255,0.35)', margin: 0, lineHeight: '1.3' }

const screenshotBorder: React.CSSProperties = { padding: '2px', borderRadius: '14px', background: RAINBOW }
const screenshotImg: React.CSSProperties = { display: 'block', width: '100%', maxWidth: '516px', borderRadius: '12px' }

const communityBorder: React.CSSProperties = { padding: '2px', borderRadius: '18px', background: 'linear-gradient(135deg, #fbbf24, #f87171, #a78bfa, #34d399, #06b6d4, #fbbf24)' }
const communityInner: React.CSSProperties = { backgroundColor: '#0d0e14', borderRadius: '16px', padding: '28px 24px', textAlign: 'center' }
const communityLabel: React.CSSProperties = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#fbbf24', margin: '0 0 12px' }
const communityText: React.CSSProperties = { fontSize: '14px', lineHeight: '1.6', color: 'rgba(224,231,255,0.5)', margin: '0 0 20px' }

const ctaAmber: React.CSSProperties = { display: 'inline-block', padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', textDecoration: 'none' }
const ctaGlass: React.CSSProperties = { display: 'inline-block', padding: '12px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'rgba(224,231,255,0.6)', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }

const rainbowDivider: React.CSSProperties = { height: '1px', margin: '0 32px', background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, #34d399, #06b6d4, #fbbf24, #f87171, transparent)', opacity: 0.4 }
const socialLabel: React.CSSProperties = { fontSize: '10px', fontWeight: 600, color: 'rgba(224,231,255,0.2)', margin: '0 0 12px', letterSpacing: '0.08em' }
const socialIcon: React.CSSProperties = { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid', textAlign: 'center', verticalAlign: 'middle' }
const socialLinkStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textDecoration: 'none', lineHeight: '44px' }

const footer: React.CSSProperties = { padding: '24px 32px 32px' }
const signoff: React.CSSProperties = { fontSize: '14px', color: 'rgba(224,231,255,0.45)', margin: '0 0 16px' }
const footerNote: React.CSSProperties = { fontSize: '11px', color: 'rgba(224,231,255,0.15)', lineHeight: '1.5', margin: '0 0 8px' }
const unsubLink: React.CSSProperties = { fontSize: '11px', color: 'rgba(165,180,252,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }
