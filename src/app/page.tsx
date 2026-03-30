import type { Metadata } from 'next'
import { LandingPage } from '@/components/features/landing/LandingPage'

export const metadata: Metadata = {
  title: 'View1 Sort — The AI That Thinks Like a Photographer',
  description:
    'AI-powered photo sorting, gallery delivery, contracts, invoicing, and business workflow for professional photographers. Sort by story, not just sharpness.',
  openGraph: {
    title: 'View1 Sort — The AI That Thinks Like a Photographer',
    description:
      'AI-powered photo sorting, gallery delivery, contracts, invoicing, and business workflow for professional photographers.',
    type: 'website',
  },
}

export default function HomePage() {
  return <LandingPage />
}
