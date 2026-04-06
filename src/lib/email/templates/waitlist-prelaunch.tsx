import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WaitlistPrelaunchEmailProps {
  firstName: string
}

export function WaitlistPrelaunchEmail({ firstName }: WaitlistPrelaunchEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Launching in 3 days. You&apos;re first.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <span style={logo}>View1 Sort</span>
          </Section>

          <Heading style={heading}>Launching in 3 days. You&apos;re first.</Heading>

          <Text style={text}>Hey {firstName},</Text>

          <Text style={text}>April 30. 3 days from now.</Text>

          <Text style={text}>View1 Sort is live.</Text>

          <Text style={text}>
            You signed up early. That means you get in before anyone else.
          </Text>

          <Section style={featureBox}>
            <Text style={featureLabel}>What you get on day 1</Text>
            <Text style={featureItem}>Unlimited photo uploads for the first 30 days</Text>
            <Text style={featureItem}>Direct access to me for onboarding</Text>
            <Text style={featureItem}>Your feedback shapes the first product update</Text>
          </Section>

          <Text style={text}>
            One ask: if you want to be a pilot user, reply to this email.
            I&apos;m taking 20 people through a hands-on session the first week.
            First 20 replies get a spot.
          </Text>

          <Text style={text}>
            Everything else launches to the public on the 30th.
          </Text>

          <Text style={text}>See you there.</Text>

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
  fontSize: '26px',
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
const hr = { borderColor: '#27272a', margin: '28px 0' }
const signoff = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 24px',
}
const footer = { color: '#52525b', fontSize: '12px', margin: '0' }
