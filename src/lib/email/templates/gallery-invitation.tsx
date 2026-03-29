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

const main = { backgroundColor: '#151312', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' }
const heading = { color: '#ffb780', fontSize: '28px', fontWeight: '700' as const, margin: '0 0 24px' }
const text = { color: '#e7e1df', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }
const projectCard = {
  backgroundColor: '#1d1b1a', border: '1px solid #534439',
  borderRadius: '12px', padding: '20px', margin: '16px 0',
}
const projectTitle = { color: '#e7e1df', fontSize: '18px', fontWeight: '600' as const, margin: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#ffb780', color: '#4e2600', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const subtext = { color: '#a18d80', fontSize: '13px', lineHeight: '1.5' }
const hr = { borderColor: '#534439', margin: '32px 0' }
const footer = { color: '#a18d80', fontSize: '12px' }
