'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* ─── Inner component (uses useSearchParams) ─────────────────────────────── */

function MagicLinkInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'request'>('loading')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // If there's a token hash from Supabase magic link, verify it
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (hash.includes('access_token') || hash.includes('type=magiclink')) {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setStatus('success')
          // Redirect to client dashboard after short delay
          setTimeout(() => {
            const next = searchParams.get('next') ?? '/client'
            router.replace(next)
          }, 1500)
        } else {
          setStatus('error')
        }
      })
    } else {
      // No token — show the request form
      setStatus('request')
    }
  }, [router, searchParams])

  const sendMagicLink = async () => {
    if (!email.trim()) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/magic-link`,
      },
    })
    setSending(false)
    if (!error) setSent(true)
  }

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-on-surface-variant/60 text-sm font-mono">Verifying your link…</p>
      </div>
    )
  }

  /* ── Success ── */
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-headline font-bold text-on-surface">You&apos;re in!</h2>
          <p className="text-on-surface-variant/60 text-sm mt-1">Redirecting you to your galleries…</p>
        </div>
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    )
  }

  /* ── Error ── */
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-headline font-bold text-on-surface">Link expired</h2>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            This magic link has expired or already been used.
          </p>
        </div>
        <button
          onClick={() => setStatus('request')}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Request a new link
        </button>
      </div>
    )
  }

  /* ── Request ── */
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-headline font-bold text-on-surface">Check your email</h2>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            We sent a magic link to <strong className="text-on-surface">{email}</strong>.
            Click the link to log in — no password needed.
          </p>
        </div>
        <p className="text-[10px] font-mono text-on-surface-variant/40 text-center">
          Link expires in 1 hour. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Access your gallery</h2>
        <p className="text-on-surface-variant/60 text-sm mt-1">
          Enter your email to receive a magic link — no account or password required.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
            placeholder="your@email.com"
            className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={sendMagicLink}
          disabled={sending || !email.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm disabled:opacity-40 hover:bg-primary/90 transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {sending ? 'Sending…' : 'Send magic link'}
        </button>
      </div>

      <p className="text-[10px] font-mono text-on-surface-variant/40 text-center">
        Magic links are one-time use and expire after 1 hour.
        Your photographer must have shared a project with you first.
      </p>
    </div>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────────────────── */

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-headline font-bold text-on-surface">View1</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20 flex flex-col items-center">
          <Suspense fallback={<Loader2 className="w-8 h-8 text-primary animate-spin" />}>
            <MagicLinkInner />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
