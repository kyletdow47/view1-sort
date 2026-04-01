import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

// GeistSans.variable = '--font-geist-sans', GeistMono.variable = '--font-geist-mono'


const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://view1sort.com'
const TITLE = 'View1 Sort — The AI That Thinks Like a Photographer'
const DESCRIPTION =
  'AI photo sorting and client delivery for professional photographers. Sort by story and emotion, not just sharpness scores. Deliver galleries, collect payments, and run your entire photography business — all in one place.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: '%s — View1 Sort' },
  description: DESCRIPTION,
  keywords: [
    'AI photo sorting', 'photo culling software', 'photographer gallery delivery',
    'client photo selection', 'photo workflow software', 'wedding photographer tools',
    'real estate photography software', 'photo delivery app', 'AI image classifier',
    'photography business management',
  ],
  authors: [{ name: 'View1 Sort' }],
  creator: 'View1 Sort',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'View1 Sort',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'View1 Sort — AI Photo Sorting for Photographers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@view1sort',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: APP_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="zinc" suppressHydrationWarning>
      <body className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans bg-background text-on-surface antialiased selection:bg-primary/20`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(var(--t-surface-container))',
              border: '1px solid rgb(var(--t-outline-variant))',
              color: 'rgb(var(--t-on-surface))',
              fontFamily: 'var(--font-geist-sans)',
            },
          }}
        />
      </body>
    </html>
  )
}
