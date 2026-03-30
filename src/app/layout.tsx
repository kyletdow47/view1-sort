import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'View1 Sort — The AI That Thinks Like a Photographer',
  description:
    'AI-powered photo sorting and client delivery for professional photographers. Sort by story and intent, not just technical quality.',
  openGraph: {
    title: 'View1 Sort — The AI That Thinks Like a Photographer',
    description:
      'AI-powered photo sorting and client delivery for professional photographers.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-theme="zinc">
      <body
        className={`${jakarta.variable} font-sans bg-background text-on-surface antialiased selection:bg-primary/20`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(var(--t-surface-container))',
              border: '1px solid rgb(var(--t-outline-variant))',
              color: 'rgb(var(--t-on-surface))',
              fontFamily: 'var(--font-jakarta)',
            },
          }}
        />
      </body>
    </html>
  )
}
