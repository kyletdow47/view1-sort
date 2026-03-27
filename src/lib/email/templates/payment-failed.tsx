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

interface PaymentFailedEmailProps {
  clientName: string
  projectName: string
  amount: string
  retryUrl: string
}

export function PaymentFailedEmail({
  clientName,
  projectName,
  amount,
  retryUrl,
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment of {amount} for {projectName} could not be processed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Payment Failed</Heading>
          <Text style={text}>Hi {clientName},</Text>
          <Text style={text}>
            We were unable to process your payment of <strong>{amount}</strong> for{' '}
            <strong>{projectName}</strong>. This usually happens when your card is declined
            or has insufficient funds.
          </Text>
          <Section style={receiptCard}>
            <Text style={receiptLine}>Project: {projectName}</Text>
            <Text style={receiptLine}>Amount: {amount}</Text>
            <Text style={failedStatus}>Failed</Text>
          </Section>
          <Text style={text}>
            Please update your payment method and try again.
          </Text>
          <Section style={buttonSection}>
            <Link href={retryUrl} style={button}>
              Retry Payment
            </Link>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you continue to have issues, please contact the photographer directly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#151312', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { color: '#ffb4a5', fontSize: '28px', fontWeight: '700' as const, margin: '0 0 24px' }
const text = { color: '#e7e1df', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }
const receiptCard = {
  backgroundColor: '#1d1b1a', border: '1px solid #534439',
  borderRadius: '12px', padding: '20px', margin: '16px 0',
}
const receiptLine = { color: '#d9c2b4', fontSize: '14px', margin: '0 0 8px' }
const failedStatus = { color: '#ffb4a5', fontSize: '14px', fontWeight: '600' as const, margin: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#ffb780', color: '#4e2600', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#534439', margin: '32px 0' }
const footer = { color: '#a18d80', fontSize: '12px' }
