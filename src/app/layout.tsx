import type { Metadata } from 'next'
import { Inter, Manrope, Space_Grotesk, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

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
