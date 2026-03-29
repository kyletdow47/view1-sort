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

interface ProjectPublishedEmailProps {
  photographerName: string
  projectName: string
  photoCount: number
  galleryUrl: string
}

export function ProjectPublishedEmail({
  photographerName,
  projectName,
  photoCount,
  galleryUrl,
}: ProjectPublishedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your photos from {photographerName} are ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your Photos Are Ready</Heading>
          <Text style={text}>
            <strong>{photographerName}</strong> has published your gallery.
          </Text>
          <Section style={projectCard}>
            <Text style={projectTitle}>{projectName}</Text>
            <Text style={photoCountText}>{photoCount} photos</Text>
          </Section>
          <Section style={buttonSection}>
            <Link href={galleryUrl} style={button}>
              View Your Gallery
            </Link>
          </Section>
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
const projectTitle = { color: '#e7e1df', fontSize: '18px', fontWeight: '600' as const, margin: '0 0 4px' }
const photoCountText = { color: '#a18d80', fontSize: '14px', margin: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#ffb780', color: '#4e2600', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: '700' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#534439', margin: '32px 0' }
const footer = { color: '#a18d80', fontSize: '12px' }
