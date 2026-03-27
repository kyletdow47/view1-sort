'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-muted text-sm mt-1">Start sorting photos with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface border border-view1-border rounded-lg px-3 py-2.5 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-view1-border rounded-lg px-3 py-2.5 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-black font-semibold rounded-lg py-2.5 text-sm hover:bg-accent-hover transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-view1-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted">or</span></div>
        </div>

        <button
          onClick={() => router.push('/onboarding')}
          className="w-full border border-view1-border text-white rounded-lg py-2.5 text-sm hover:bg-white/5 transition-colors"
        >
          Sign up with Google
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
