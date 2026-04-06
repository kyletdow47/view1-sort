import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WaitlistDay3EmailProps {
  firstName: string
}

export function WaitlistDay3Email({ firstName }: WaitlistDay3EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>184 commits. 11 days. Here&apos;s everything I built.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <span style={logo}>View1 Sort</span>
          </Section>

          <Heading style={heading}>184 commits. 11 days. Here&apos;s everything I built.</Heading>

          <Text style={text}>Hey {firstName},</Text>

          <Text style={text}>I started building View1 Sort 11 days ago.</Text>

          <Text style={text}>Not as a side project. As a full sprint.</Text>

          <Text style={text}>184 commits. Solo. Here&apos;s what&apos;s actually in it:</Text>

          <Section style={featureBox}>
            <Text style={featureLabel}>The product right now</Text>
            <Text style={featureItem}>25 dashboard sections built and working</Text>
            <Text style={featureItem}>AI sort workspace (sort goes live Thursday)</Text>
            <Text style={featureItem}>Gallery delivery with Stripe checkout</Text>
            <Text style={featureItem}>Client portal with package selection</Text>
            <Text style={featureItem}>Contracts, questionnaires, invoices</Text>
            <Text style={featureItem}>Booking calendar with availability</Text>
            <Text style={featureItem}>A QA system I built inside the product itself</Text>
          </Section>

          <Section style={featureBox}>
            <Text style={featureLabel}>The process</Text>
            <Text style={text2}>
              I&apos;m building with AI agents. Each one has a role.
              One plans. One builds UI. One writes database logic.
              I direct. They build. I ship.
            </Text>
            <Text style={text2}>It&apos;s not magic. It&apos;s a system.</Text>
          </Section>

          <Text style={text}>
            I&apos;m posting the whole process on Instagram daily. Every commit, every debug session,
            every failure.
          </Text>

          <Section style={ctaSection}>
            <Link href="https://instagram.com/kyledow" style={ctaButton}>
              Follow on Instagram
            </Link>
          </Section>

          <Text style={text}>Launch is April 30. You&apos;ll get the first email.</Text>

          <Hr style={hr} />

          <Text style={signoff}>Kyle</Text>

          <Text style={footer}>
            You received this because you joined the View1 Sort waitlist at view1sort.com.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#09090b', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { margin: '0 auto', padding: '40px 32px', maxWidth: '560px' }
const logoSection = { marginBottom: '32px' }
const logo = {
  display: 'inline-block' as const,
  background: '#6366f1',
  borderRadius: '8px',
  padding: '8px 14px',
  fontSize: '17px',
  fontWeight: '900' as const,
  letterSpacing: '-0.5px',
  color: '#ffffff',
}
const heading = {
  color: '#f4f4f5',
  fontSize: '24px',
  fontWeight: '800' as const,
  margin: '0 0 20px',
  lineHeight: '1.2',
}
const text = {
  color: '#a1a1aa',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}
const text2 = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 8px',
}
const featureBox = {
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '10px',
  padding: '20px 24px',
  margin: '8px 0 24px',
}
const featureLabel = {
  fontSize: '11px',
  fontWeight: '700' as const,
  color: '#6366f1',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}
const featureItem = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.9',
  margin: '0',
}
const ctaSection = { margin: '8px 0 24px' }
const ctaButton = {
  backgroundColor: '#6366f1',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const hr = { borderColor: '#27272a', margin: '28px 0' }
const signoff = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 24px',
}
const footer = { color: '#52525b', fontSize: '12px', margin: '0' }
