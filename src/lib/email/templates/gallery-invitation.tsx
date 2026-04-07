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

interface GalleryInvitationEmailProps {
  photographerName: string
  projectName: string
  galleryUrl: string
}

export function GalleryInvitationEmail({
  photographerName,
  projectName,
  galleryUrl,
}: GalleryInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{photographerName} shared a gallery with you: {projectName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;ve Been Invited</Heading>
          <Text style={text}>
            <strong>{photographerName}</strong> has shared a photo gallery with you.
          </Text>
          <Section style={projectCard}>
            <Text style={projectTitle}>{projectName}</Text>
          </Section>
          <Section style={buttonSection}>
            <Link href={galleryUrl} style={button}>
              View Gallery
            </Link>
          </Section>
          <Text style={subtext}>
            Click the button above to view the gallery. You may be asked to sign in to access all photos.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Sent via View1 Sort on behalf of {photographerName}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0d0e14', fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { color: '#818cf8', fontSize: '28px', fontWeight: '700' as const, margin: '0 0 24px' }
const text = { color: '#E0E7FF', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }
const projectCard = {
  backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', padding: '20px', margin: '16px 0',
}
const projectTitle = { color: '#ffffff', fontSize: '18px', fontWeight: '600' as const, margin: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', padding: '16px 40px',
  borderRadius: '12px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const subtext = { color: 'rgba(224,231,255,0.35)', fontSize: '13px', lineHeight: '1.5' }
const hr = { borderColor: 'rgba(255,255,255,0.06)', margin: '32px 0' }
const footer = { color: 'rgba(224,231,255,0.2)', fontSize: '12px' }
