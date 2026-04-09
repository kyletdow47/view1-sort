'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AIStatus = 'unknown' | 'checking' | 'connected' | 'not_configured' | 'error'

interface HealthResponse {
  status: 'connected' | 'not_configured' | 'error'
  message: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AIConfigSection() {
  const [status, setStatus] = useState<AIStatus>('unknown')
  const [message, setMessage] = useState<string>('')

  const testConnection = useCallback(async () => {
    setStatus('checking')
    setMessage('')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    try {
      const res = await fetch('/api/ai/health', { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = (await res.json()) as HealthResponse
      setStatus(data.status)
      setMessage(data.message)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      clearTimeout(timeout)
    }
  }, [])

  const statusConfig = {
    unknown: { color: 'text-white/40', bg: 'bg-white/[0.06]', label: 'Not tested' },
    checking: { color: 'text-white/40', bg: 'bg-white/[0.06]', label: 'Checking...' },
    connected: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Connected' },
    not_configured: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Not configured' },
    error: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Error' },
  }

  const cfg = statusConfig[status]

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Configuration</h3>
            <p className="text-xs text-white/50">Claude AI powers captions, vibe parsing, and business insights</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${cfg.bg}`}
          style={{ borderColor: status === 'connected' ? 'rgba(52,211,153,0.3)' : status === 'not_configured' ? 'rgba(251,191,36,0.3)' : status === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)' }}>
          {status === 'connected' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          {status === 'not_configured' && <AlertCircle className="h-3 w-3 text-amber-400" />}
          {status === 'error' && <AlertCircle className="h-3 w-3 text-red-400" />}
          {status === 'checking' && <RefreshCw className="h-3 w-3 animate-spin text-white/40" />}
          <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <p className={`mb-4 text-xs ${status === 'connected' ? 'text-emerald-400/70' : status === 'not_configured' ? 'text-amber-400/70' : 'text-red-400/70'}`}>
          {message}
        </p>
      )}

      {/* Setup instructions (shown when not configured) */}
      {(status === 'not_configured' || status === 'unknown') && (
        <div className="mb-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="mb-2 text-xs font-semibold text-white/60">Setup Instructions</p>
          <ol className="flex flex-col gap-2 text-xs text-white/45">
            <li className="flex gap-2">
              <span className="shrink-0 text-indigo-400">1.</span>
              <span>
                Get your API key from the{' '}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-indigo-400 underline hover:text-indigo-300">
                  Anthropic Console <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 text-indigo-400">2.</span>
              <span>Add the key to your Supabase Edge Function secrets:</span>
            </li>
          </ol>
          <div className="mt-2 rounded-lg bg-black/30 px-3 py-2 font-mono text-[11px] text-white/60">
            npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            The key is only used server-side in Edge Functions. It is never exposed to the browser.
          </p>
        </div>
      )}

      {/* Features powered by Claude */}
      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">Features powered by Claude AI</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Caption Generation', desc: 'Social media captions with tone variants' },
            { name: 'Vibe Parsing', desc: 'Natural language to style parameters' },
            { name: 'Business Insights', desc: 'AI-powered analytics and briefings' },
          ].map((f) => (
            <div key={f.name} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-medium text-white/70">{f.name}</p>
              <p className="text-[10px] text-white/35">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graceful degradation note */}
      <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-[11px] text-indigo-300/60">
          When Claude AI is not configured, all features gracefully degrade to built-in heuristics and mock data. No functionality is lost — AI just makes it better.
        </p>
      </div>

      {/* Test Connection button */}
      <button
        onClick={() => void testConnection()}
        disabled={status === 'checking'}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
      >
        {status === 'checking' ? (
          <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Testing...</>
        ) : (
          <><Sparkles className="h-3.5 w-3.5" /> Test Connection</>
        )}
      </button>
    </div>
  )
}
