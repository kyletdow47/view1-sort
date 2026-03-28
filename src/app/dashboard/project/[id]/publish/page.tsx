'use client'

import { useState, useEffect } from 'react'
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Copy,
  Mail,
  Palette,
  Eye,
  ImageIcon,
  DollarSign,
  Users,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const checklistItems = [
  { label: 'Has media', done: true, description: '48 photos uploaded to this project', icon: ImageIcon },
  { label: 'Pricing set', done: true, description: 'Per-file pricing at $12/photo', icon: DollarSign },
  { label: 'Gallery theme selected', done: true, description: 'Using "Minimal Dark" theme', icon: Palette },
  { label: 'Client invited', done: false, description: 'Send your client a magic link to view', icon: Users },
]

const themes = [
  { id: 'minimal-dark', name: 'Minimal Dark', active: true, bg: '#151312', accent: '#ffb780' },
  { id: 'clean-light', name: 'Clean Light', active: false, bg: '#f5f3f0', accent: '#d48441' },
  { id: 'editorial', name: 'Editorial', active: false, bg: '#1a1a1a', accent: '#95d1d1' },
  { id: 'warm-earth', name: 'Warm Earth', active: false, bg: '#1d1916', accent: '#ffb4a5' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PublishPage() {
  const params = useParams()
  const projectId = params.id as string
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('minimal-dark')
  const [isPublished, setIsPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const allReady = checklistItems.filter((i) => i.done).length
  const totalItems = checklistItems.length
  const readyPercent = Math.round((allReady / totalItems) * 100)

  const galleryUrl = `https://view1.studio/g/${projectId}`

  // Load project data on mount to check current status
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('status, published_at, gallery_theme').eq('id', projectId).single()
      if (data) {
        if (data.status === 'published') setIsPublished(true)
        if (data.gallery_theme) setSelectedTheme(data.gallery_theme)
      }
    }
    load()
  }, [projectId])

  const handleCopy = () => {
    navigator.clipboard.writeText(galleryUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublish = async () => {
    setPublishing(true)
    setPublishError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('projects').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', projectId)
      if (error) throw error
      setIsPublished(true)
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish gallery')
    } finally {
      setPublishing(false)
    }
  }

  const handleInvite = async () => {
    if (!email) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)
    try {
      const res = await fetch(`/api/gallery/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send invite')
      }
      setInviteSuccess(true)
      setEmail('')
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Send size={20} className="text-[#4e2600]" />
          </div>
          Publish Gallery
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Review and publish your gallery for client viewing
        </p>
      </div>

      {/* Pre-publish Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Pre-publish Checklist
            </h2>
          </div>
          <span className="text-xs font-medium text-on-surface-variant">
            {allReady}/{totalItems} complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-surface-container-highest mb-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441] transition-all"
            style={{ width: `${readyPercent}%` }}
          />
        </div>

        <div className="space-y-3">
          {checklistItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={`flex items-start gap-3 rounded-xl p-4 border transition-colors ${
                  item.done
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-surface-container border-outline-variant/20'
                }`}
              >
                {item.done ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 mt-0.5">
                    <Check size={14} className="text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-highest mt-0.5">
                    <Circle size={14} className="text-on-surface-variant/30" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.done ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-on-surface-variant/50 mt-0.5">{item.description}</p>
                </div>
                <Icon size={16} className={item.done ? 'text-emerald-400/50' : 'text-on-surface-variant/20'} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Gallery Preview */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Eye size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Gallery Preview
          </h2>
        </div>

        {/* Mini preview */}
        <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-[#151312] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-[#ffb780] to-[#d48441]" />
            <span className="text-xs font-bold text-[#e7e1df]">Sarah & James Wedding</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded bg-[#2c2928] flex items-center justify-center"
              >
                <ImageIcon size={12} className="text-[#534439]" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-[#a18d80]">48 photos</span>
            <span className="text-[10px] text-[#ffb780]">Minimal Dark</span>
          </div>
        </div>
      </Card>

      {/* Theme Selector (compact) */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Gallery Theme
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                selectedTheme === theme.id
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div
                className="h-10 w-10 rounded-lg border border-outline-variant/20 flex items-center justify-center"
                style={{ backgroundColor: theme.bg }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-on-surface">{theme.name}</p>
                {selectedTheme === theme.id && (
                  <span className="text-[10px] text-primary">Active</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Gallery Link */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <LinkIcon size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Gallery Link
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
            <span className="text-sm text-on-surface">
              {galleryUrl}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              copied
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </Card>

      {/* Client Invitation */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Mail size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Invite Client
          </h2>
        </div>

        <p className="text-sm text-on-surface-variant mb-4">
          Send a magic link to your client so they can access the gallery without a password.
        </p>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full rounded-lg bg-surface-container pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting || !email}
            className="flex items-center gap-2 rounded-lg bg-surface-container px-5 py-2.5 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary transition-all whitespace-nowrap disabled:opacity-60"
          >
            {inviting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {inviting ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>

        {inviteSuccess && (
          <p className="text-sm text-green-400 mt-2">Magic link sent successfully!</p>
        )}
        {inviteError && (
          <p className="text-sm text-red-400 mt-2">{inviteError}</p>
        )}
      </Card>

      {/* Publish status / error */}
      {publishError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{publishError}</p>
        </div>
      )}

      {/* Publish Button */}
      {isPublished ? (
        <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 py-4 font-headline font-bold text-lg text-green-400">
          <CheckCircle2 size={20} />
          Gallery Published
        </div>
      ) : (
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-4 font-headline font-bold text-lg text-[#4e2600] transition-opacity hover:opacity-90 shadow-lg shadow-[#d48441]/20 disabled:opacity-60"
        >
          {publishing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          {publishing ? 'Publishing...' : 'Publish Gallery'}
        </button>
      )}

      <p className="text-center text-xs text-on-surface-variant/50">
        {isPublished
          ? 'Your gallery is live. Share the link above with your client.'
          : 'Once published, your client will receive an email notification with a viewing link'}
      </p>
    </div>
  )
}
