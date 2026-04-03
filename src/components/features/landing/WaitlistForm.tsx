'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export function WaitlistForm({ size = 'default' }: { size?: 'default' | 'large' }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, photographer_type: type }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${size === 'large' ? 'py-6' : 'py-4'}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-400/20 text-violet-400">
          <CheckCircle size={24} />
        </div>
        <p className={`font-semibold text-white ${size === 'large' ? 'text-xl' : 'text-base'}`}>You&apos;re on the list.</p>
        <p className="text-sm text-white/50">We&apos;ll email you when access opens.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 w-full ${size === 'large' ? 'max-w-lg mx-auto' : 'max-w-md'}`}>
      {size === 'large' && (
        <div className="flex gap-3">
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/40 transition-all backdrop-blur-sm" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white/40 outline-none focus:border-violet-400/40 transition-all backdrop-blur-sm appearance-none">
            <option value="">Photography type</option>
            <option value="wedding">Wedding</option>
            <option value="real_estate">Real Estate</option>
            <option value="commercial">Commercial</option>
            <option value="fashion">Fashion / Portrait</option>
            <option value="event">Event</option>
          </select>
        </div>
      )}
      <div className="flex gap-0 rounded-xl border border-white/15 bg-white/[0.06] overflow-hidden backdrop-blur-sm">
        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required
          className={`flex-1 px-4 text-sm text-white placeholder-white/30 outline-none bg-transparent ${size === 'large' ? 'py-4' : 'py-3'}`} />
        <button type="submit" disabled={loading}
          className={`shrink-0 btn-rainbow px-6 transition-all disabled:opacity-60 ${size === 'large' ? 'py-4 text-base' : 'py-3 text-sm'}`}>
          {loading ? 'Joining…' : 'Get Early Access'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-center text-xs text-white/30">Free to join · Early access + lifetime discount for waitlist members</p>
    </form>
  )
}
