'use client'

import { useCallback, useEffect, useState } from 'react'
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
import type { GalleryTheme, Project } from '@/types/supabase'

/* ── Themes ── */
const themes = [
  { id: 'dark' as const, name: 'Minimal Dark', bg: '#151312', accent: '#ffb780' },
  { id: 'light' as const, name: 'Clean Light', bg: '#f5f3f0', accent: '#d48441' },
  { id: 'minimal' as const, name: 'Editorial', bg: '#1a1a1a', accent: '#95d1d1' },
  { id: 'editorial' as const, name: 'Warm Earth', bg: '#1d1916', accent: '#ffb4a5' },
]

/* ── Helpers ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}
void SectionLabel

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}>
      {children}
    </div>
  )
}

/* ── Page ── */
export default function PublishPage() {
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [mediaCount, setMediaCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [galleryUrl, setGalleryUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<GalleryTheme>('dark')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (proj) {
        const p = proj as Project
        setProject(p)
        setSelectedTheme(p.gallery_theme ?? 'dark')
        setPublished(p.status === 'published')
        if (p.status === 'published') {
          setGalleryUrl(`${window.location.origin}/gallery/${projectId}`)
        }
      }

      const { count } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      setMediaCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [supabase, projectId])

  const handlePublish = useCallback(async () => {
    setPublishing(true)
    setError(null)
    try {
      const response = await fetch('/api/projects/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          theme: selectedTheme,
          galleryPublic: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setPublished(true)
      setGalleryUrl(data.galleryUrl ?? `${window.location.origin}/gallery/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }, [projectId, selectedTheme])

  const handleInvite = useCallback(async () => {
    if (!email) return
    setInviting(true)
    setError(null)
    try {
      const response = await fetch('/api/projects/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setInviteSent(true)
      setEmail('')
      setTimeout(() => setInviteSent(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }, [projectId, email])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(galleryUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [galleryUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const hasPricing = project?.pricing_model !== 'free'
  const checklistItems = [
    { label: 'Has media', done: mediaCount > 0, description: `${mediaCount} photos uploaded`, icon: ImageIcon },
    { label: 'Pricing set', done: true, description: hasPricing ? `${project?.pricing_model} pricing` : 'Free gallery', icon: DollarSign },
    { label: 'Gallery theme selected', done: true, description: `Using "${themes.find((t) => t.id === selectedTheme)?.name}" theme`, icon: Palette },
    { label: 'Client invited', done: inviteSent, description: inviteSent ? 'Invitation sent' : 'Send your client a magic link to view', icon: Users },
  ]

  const allReady = checklistItems.filter((i) => i.done).length
  const totalItems = checklistItems.length
  const readyPercent = Math.round((allReady / totalItems) * 100)

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Send size={20} className="text-[#4e2600]" />
          </div>
          {published ? 'Gallery Published' : 'Publish Gallery'}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {published ? `"${project?.name}" is live` : 'Review and publish your gallery for client viewing'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Pre-publish Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {published ? 'Published' : 'Pre-publish Checklist'}
            </h2>
          </div>
          <span className="text-xs font-medium text-on-surface-variant">
            {allReady}/{totalItems} complete
          </span>
        </div>

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

      {/* Theme Selector */}
      {!published && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Palette size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">Gallery Theme</h2>
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
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-on-surface">{theme.name}</p>
                  {selectedTheme === theme.id && <span className="text-[10px] text-primary">Active</span>}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Gallery Link (shown after publishing) */}
      {published && galleryUrl && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <LinkIcon size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">Gallery Link</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
              <span className="text-sm text-on-surface break-all">{galleryUrl}</span>
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
      )}

      {/* Client Invitation */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Mail size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">Invite Client</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">
          Send a magic link to your client so they can access the gallery.
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
            className="flex items-center gap-2 rounded-lg bg-surface-container px-5 py-2.5 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary transition-all whitespace-nowrap disabled:opacity-50"
          >
            {inviting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {inviteSent ? 'Sent!' : 'Send Magic Link'}
          </button>
        </div>
      </Card>

      {/* Publish Button */}
      {!published && (
        <button
          onClick={handlePublish}
          disabled={publishing || mediaCount === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-4 font-headline font-bold text-lg text-[#4e2600] transition-opacity hover:opacity-90 shadow-lg shadow-[#d48441]/20 disabled:opacity-50"
        >
          {publishing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          {publishing ? 'Publishing...' : 'Publish Gallery'}
        </button>
      )}

      {published && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <p className="text-sm font-medium text-emerald-400">
            Gallery is live and ready for clients!
          </p>
        </div>
      )}
    </div>
  )
}
