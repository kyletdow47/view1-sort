import type { Metadata } from 'next'
import { LandingPage } from '@/components/features/landing/LandingPage'

export const metadata: Metadata = {
  title: 'View1 Sort — AI Photo Sorting & Delivery for Photographers',
  description:
    'AI-powered photo sorting that understands your shoot — not just sharpness. Sort, deliver, invoice, and manage clients in one place. Built by photographers.',
  openGraph: {
    title: 'View1 Sort — Sort by Story, Not Just Sharpness',
    description:
      'AI photo sorting, client galleries, invoicing, and business tools — built for professional photographers.',
    type: 'website',
  },
}

export default function HomePage() {
  return <LandingPage />
}
