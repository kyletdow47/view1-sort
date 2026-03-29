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

interface PaymentReceivedEmailProps {
  photographerName: string
  clientEmail: string
  projectName: string
  amount: string
  dashboardUrl: string
}

export function PaymentReceivedEmail({
  photographerName,
  clientEmail,
  projectName,
  amount,
  dashboardUrl,
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You received {amount} for {projectName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Payment Received</Heading>
          <Text style={text}>Hi {photographerName},</Text>
          <Text style={text}>
            Great news! You&apos;ve received a payment.
          </Text>
          <Section style={receiptCard}>
            <Text style={receiptLine}>Client: {clientEmail}</Text>
            <Text style={receiptLine}>Project: {projectName}</Text>
            <Text style={amountText}>{amount}</Text>
          </Section>
          <Text style={text}>
            This payment will be transferred to your connected Stripe account.
          </Text>
          <Section style={buttonSection}>
            <Link href={`${dashboardUrl}/billing`} style={button}>
              View Finances
            </Link>
          </Section>
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
const heading = { color: '#95d1d1', fontSize: '28px', fontWeight: '700' as const, margin: '0 0 24px' }
const text = { color: '#e7e1df', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }
const receiptCard = {
  backgroundColor: '#1d1b1a', border: '1px solid #534439',
  borderRadius: '12px', padding: '20px', margin: '16px 0',
}
const receiptLine = { color: '#d9c2b4', fontSize: '14px', margin: '0 0 8px' }
const amountText = { color: '#95d1d1', fontSize: '28px', fontWeight: '700' as const, margin: '8px 0 0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#ffb780', color: '#4e2600', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#534439', margin: '32px 0' }
const footer = { color: '#a18d80', fontSize: '12px' }
