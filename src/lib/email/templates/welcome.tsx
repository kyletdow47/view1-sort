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

interface WelcomeEmailProps {
  displayName: string
  appUrl: string
}

export function WelcomeEmail({ displayName, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to View1 Sort — let&apos;s get your photos organized</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to View1 Sort</Heading>
          <Text style={text}>Hi {displayName},</Text>
          <Text style={text}>
            Thanks for signing up! View1 Sort uses AI to automatically organize your photos
            so you can deliver curated galleries to your clients faster.
          </Text>
          <Section style={buttonSection}>
            <Link href={`${appUrl}/dashboard`} style={button}>
              Go to Dashboard
            </Link>
          </Section>
          <Text style={text}>
            Here&apos;s what to do next:
          </Text>
          <Text style={text}>
            1. Create your first project{'\n'}
            2. Upload your photos{'\n'}
            3. Let AI sort them into categories{'\n'}
            4. Review, publish, and share with your client
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            View1 Sort — AI-powered photo sorting for professionals
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#151312', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { color: '#ffb780', fontSize: '28px', fontWeight: '700' as const, margin: '0 0 24px' }
const text = { color: '#e7e1df', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#ffb780', color: '#4e2600', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#534439', margin: '32px 0' }
const footer = { color: '#a18d80', fontSize: '12px' }
