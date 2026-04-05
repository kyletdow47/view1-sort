'use client'

// =============================================================================
// /auth/client-login — Client Magic Link Login
//
// Clients receive a magic link from their photographer via email.
// This page handles two states:
//   1. No token → show email input form to request a magic link
//   2. Token in URL hash → verify session → redirect to /client
//
// This is the same flow as /auth/magic-link but branded for the client portal
// and always redirects to /client on success.
// =============================================================================

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, XCircle, Mail, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be in Suspense)
// ---------------------------------------------------------------------------

function ClientLoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'form'>('loading')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    // Check if returning from magic link click (Supabase puts token in hash)
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (hash.includes('access_token') || hash.includes('type=magiclink')) {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setStatus('success')
          const next = searchParams.get('next') ?? '/client'
          setTimeout(() => router.replace(next), 1500)
        } else {
          setStatus('error')
          setErrorMessage('The link could not be verified. It may have expired or already been used.')
        }
      })
    } else {
      setStatus('form')
    }
  }, [router, searchParams])

  const sendMagicLink = async () => {
    if (!email.trim()) return
    setSending(true)
    setErrorMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/client-login`,
      },
    })
    setSending(false)
    if (error) {
      setErrorMessage(error.message)
    } else {
      setSent(true)
    }
  }

  /* ── Verifying token ── */
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#5749F4]" />
        <p className="font-mono text-sm text-white/50">Verifying your link…</p>
      </div>
    )
  }

  /* ── Success ── */
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">You&apos;re in!</h2>
          <p className="mt-1 text-sm text-white/50">Redirecting to your galleries…</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-[#5749F4]" />
      </div>
    )
  }

  /* ── Error ── */
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Link expired</h2>
          <p className="mt-1 text-sm text-white/50">
            {errorMessage || 'This magic link has expired or already been used.'}
          </p>
        </div>
        <button
          onClick={() => { setStatus('form'); setErrorMessage('') }}
          className="rounded-xl bg-[#5749F4] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Request a new link
        </button>
      </div>
    )
  }

  /* ── Sent ── */
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5749F4]/20">
          <Mail className="h-8 w-8 text-[#5749F4]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="mt-1 text-sm text-white/50">
            We sent a magic link to{' '}
            <strong className="text-white">{email}</strong>.{' '}
            Click the link to access your galleries — no password needed.
          </p>
        </div>
        <p className="font-mono text-[10px] text-center text-white/30">
          Link expires in 1 hour. Check your spam folder if you don&apos;t see it.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-xs text-white/40 underline underline-offset-2 hover:text-white/60"
        >
          Use a different email
        </button>
      </div>
    )
  }

  /* ── Request form ── */
  return (
    <div className="w-full space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Access your galleries</h2>
        <p className="mt-1 text-sm text-white/50">
          Enter your email to receive a magic link. No account or password required.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#5749F4]/60 focus:outline-none focus:ring-2 focus:ring-[#5749F4]/20"
          />
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </p>
        )}

        <button
          onClick={sendMagicLink}
          disabled={sending || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #5749F4 0%, #8B5CF6 100%)',
          }}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {sending ? 'Sending…' : 'Send magic link'}
        </button>
      </div>

      <p className="font-mono text-[10px] text-center text-white/30">
        Magic links are one-time use and expire after 1 hour.
        Your photographer must have shared a gallery with your email first.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

export default function ClientLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0D0B1A] p-4">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 55% 45% at 70% 10%, rgba(87,73,244,0.15) 0%, transparent 70%)',
            'radial-gradient(ellipse 45% 40% at 20% 80%, rgba(139,92,246,0.10) 0%, transparent 70%)',
            'linear-gradient(160deg, #030305 0%, #080810 50%, #030305 100%)',
          ].join(', '),
        }}
      />

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5749F4]/20 border border-[#5749F4]/30">
            <Camera className="h-7 w-7 text-[#5749F4]" />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#5749F4]" />
              <span className="text-lg font-bold text-white">View1</span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">Client Gallery Portal</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-8 backdrop-blur-xl">
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-[#5749F4]" />}>
            <ClientLoginInner />
          </Suspense>
        </div>

        <p className="text-center text-xs text-white/20">
          Powered by{' '}
          <a
            href="https://view1.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/50 underline underline-offset-2"
          >
            View1
          </a>
        </p>
      </div>
    </div>
  )
}
