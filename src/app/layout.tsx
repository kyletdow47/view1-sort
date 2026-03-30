import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('v1-theme');if(t&&t!=='warm')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans bg-background text-on-surface selection:bg-primary/20 antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--toast-bg, #211f1e)',
              border: '1px solid var(--toast-border, #534439)',
              color: 'var(--toast-text, #e7e1df)',
              fontFamily: 'var(--font-plus-jakarta-sans), system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
