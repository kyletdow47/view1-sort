import type { Metadata } from 'next'
import { Inter, Manrope, Space_Grotesk, Playfair_Display } from 'next/font/google'
// @ts-expect-error — @vercel/analytics is added to package.json; install with npm ci
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

// display: 'swap' prevents invisible text during font load (improves CLS & LCP)
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })

export const metadata: Metadata = {
  title: 'View1 Sort — AI Photo Sorting for Professional Photographers',
  description: 'AI-powered photo sorting and client delivery for professional photographers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${playfair.variable} font-body bg-background text-on-surface selection:bg-primary/30 antialiased`}>
        {children}
        <Analytics />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#211f1e',
              border: '1px solid #534439',
              color: '#e7e1df',
            },
          }}
        />
      </body>
    </html>
  )
}
