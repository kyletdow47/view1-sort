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

interface WaitlistConfirmationEmailProps {
  firstName: string
}

export function WaitlistConfirmationEmail({ firstName }: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the list. View1 Sort launches April 30.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <span style={logo}>View1 Sort</span>
          </Section>

          <Heading style={heading}>Hey {firstName}, you&apos;re in.</Heading>

          <Text style={text}>
            I&apos;m building View1 Sort for photographers who are tired of juggling 5 apps to get paid
            for one shoot. AI sorting, gallery delivery, client payments. One place.
          </Text>

          <Text style={text}>Launching April 30.</Text>

          <Text style={text}>
            First cohort is 20 photographers. You&apos;re early.
          </Text>

          <Section style={featureBox}>
            <Text style={featureLabel}>What&apos;s coming on launch day</Text>
            <Text style={featureItem}>AI sorts 847 photos in under 12 minutes</Text>
            <Text style={featureItem}>Gallery delivery with client payment built in</Text>
            <Text style={featureItem}>Contracts, invoices, and Stripe — no third-party tools</Text>
          </Section>

          <Text style={text}>Follow along while I build:</Text>
          <Section style={socialRow}>
            <Link href="https://instagram.com/kyledow" style={socialLink}>Instagram</Link>
            <span style={socialDivider}> · </span>
            <Link href="https://twitter.com/kyledow" style={socialLink}>Twitter / X</Link>
          </Section>

          <Hr style={hr} />

          <Text style={signoff}>Kyle{'\n'}Founder, View1 Sort</Text>

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
const socialRow = { margin: '0 0 24px' }
const socialLink = {
  color: '#6366f1',
  fontSize: '14px',
  textDecoration: 'none',
}
const socialDivider = { color: '#3f3f46', fontSize: '14px' }
const hr = { borderColor: '#27272a', margin: '28px 0' }
const signoff = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 24px',
  whiteSpace: 'pre-line' as const,
}
const footer = { color: '#52525b', fontSize: '12px', margin: '0' }
