'use client'

import {
  Camera,
  Mail,
  Globe,
  ChevronDown,
  Zap,
  Trash2,
  Check,
  Save,
  Loader2,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const CURRENCIES = ['USD', 'EUR', 'GBP'] as const
type Currency = (typeof CURRENCIES)[number]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
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
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [currency, setCurrency] = useState<Currency>('USD')
  const [sensitivity, setSensitivity] = useState(72)
  const [autoSync, setAutoSync] = useState(true)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        const [profileResult, workspaceResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('display_name,avatar_url')
            .eq('id', user.id)
            .single(),
          supabase
            .from('workspaces')
            .select('id,name')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single(),
        ])

        if (profileResult.data) {
          setDisplayName(profileResult.data.display_name ?? '')
          setAvatarUrl(profileResult.data.avatar_url)
          setAvatarPreview(profileResult.data.avatar_url)
        }
        if (workspaceResult.data) {
          setBusinessName(workspaceResult.data.name)
          setWorkspaceId(workspaceResult.data.id)
        }
      } finally {
        setProfileLoading(false)
      }
    }

    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path)
        setAvatarUrl(publicUrl)
      }
    },
    [user, supabase],
  )

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)
    setSaveStatus('idle')
    setSaveError(null)

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null, avatar_url: avatarUrl })
        .eq('id', user.id)
      if (profileError) throw new Error(profileError.message)

      if (workspaceId && businessName.trim()) {
        const { error: wsError } = await supabase
          .from('workspaces')
          .update({ name: businessName.trim() })
          .eq('id', workspaceId)
        if (wsError) throw new Error(wsError.message)
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }, [user, supabase, displayName, businessName, avatarUrl, workspaceId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Profile</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your studio identity and display name
        </p>
      </div>

      {/* Studio Identity */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Camera size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">Studio Identity</h2>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-6">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container overflow-hidden hover:border-primary/40 transition-colors"
                  title="Upload avatar"
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Camera size={28} className="text-on-surface-variant/30" />
                  )}
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Upload Logo
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <SectionLabel>Full Name</SectionLabel>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <SectionLabel>Business Name</SectionLabel>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your studio name"
                    className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <SectionLabel>Email</SectionLabel>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
                    <Mail size={14} className="text-on-surface-variant/50" />
                    <span className="text-sm text-on-surface">{user?.email ?? '—'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <SectionLabel>Portfolio URL</SectionLabel>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
                    <Globe size={14} className="text-on-surface-variant/50" />
                    <span className="text-sm text-primary">
                      view1.studio/
                      {businessName.toLowerCase().replace(/\s+/g, '-') || 'your-studio'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saveStatus === 'success' && (
                <span className="text-sm text-secondary flex items-center gap-1">
                  <Check size={14} />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-error">{saveError}</span>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Global Workflow */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Zap size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">Global Workflow</h2>
        </div>

        <div className="space-y-6">
          {/* Default Preset */}
          <div className="space-y-1.5">
            <SectionLabel>Default Sorting Preset</SectionLabel>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50">
                <option>Wedding Architecture</option>
                <option>Real Estate Pro</option>
                <option>Editorial Travel</option>
                <option>Portrait Session</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <SectionLabel>Currency</SectionLabel>
            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                    currency === c
                      ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary'
                      : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* AI Culling Sensitivity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>AI Culling Sensitivity</SectionLabel>
              <span className="text-xs font-medium text-primary">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full accent-[var(--color-primary,#5749F4)]"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/50">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          {/* Auto-Sync */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-secondary" />
              <span className="text-sm text-on-surface">Auto-Sync to Cloud</span>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoSync ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  autoSync ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="!border-red-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={18} className="text-error" />
          <h2 className="font-headline font-bold text-lg text-error">Danger Zone</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-error transition-colors hover:bg-red-500/20">
          Delete Account
        </button>
      </Card>
    </div>
  )
}
