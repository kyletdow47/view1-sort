'use client'

import {
  Settings,
  Camera,
  Mail,
  Globe,
  ChevronDown,
  Zap,
  Trash2,
  Crown,
  Check,
  HardDrive,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Save,
  Loader2,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const currencies = ['USD', 'EUR', 'GBP'] as const
const planFeatures = [
  'Unlimited Projects',
  'AI-Powered Sorting',
  'Custom Client Galleries',
  'Stripe Connect Integration',
  'Priority Support',
  'Custom Branding',
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
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

function ProgressBar({
  label,
  value,
  max,
  unit,
  color = 'bg-primary',
}: {
  label: string
  value: number
  max: number
  unit: string
  color?: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-on-surface">{label}</span>
        <span className="text-xs text-on-surface-variant">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-container-highest">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  // Profile state
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

  // UI-only workflow state
  const [currency, setCurrency] = useState<(typeof currencies)[number]>('USD')
  const [sensitivity, setSensitivity] = useState(72)
  const [autoSync, setAutoSync] = useState(true)

  // Load profile + workspace on mount
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

      // Show local preview immediately
      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      // Upload to Supabase Storage (avatars bucket)
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
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
          Control Panel
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your studio profile, workflow defaults, and subscription
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* ====== LEFT COLUMN (8) ====== */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Studio Identity */}
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Camera size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Studio Identity
              </h2>
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
                        <span className="text-sm text-on-surface">
                          {user?.email ?? '—'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <SectionLabel>Portfolio URL</SectionLabel>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
                        <Globe size={14} className="text-on-surface-variant/50" />
                        <span className="text-sm text-primary">
                          view1.studio/{businessName.toLowerCase().replace(/\s+/g, '-') || 'your-studio'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save row */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441] px-5 py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-60"
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
              <Settings size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Global Workflow
              </h2>
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
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                        currency === c
                          ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
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
                  <span className="text-xs font-medium text-primary">
                    {sensitivity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-[#d48441]"
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
                  <span className="text-sm text-on-surface">
                    Auto-Sync to Cloud
                  </span>
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
              <h2 className="font-headline font-bold text-lg text-error">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-error transition-colors hover:bg-red-500/20">
              Delete Account
            </button>
          </Card>
        </div>

        {/* ====== RIGHT COLUMN (4) ====== */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Pro Studio Subscription */}
          <Card className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#ffb780]/20 to-[#d48441]/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Crown size={18} className="text-primary" />
                <SectionLabel>Current Plan</SectionLabel>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                Pro Studio
              </h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-primary">
                  $39
                </span>
                <span className="text-sm text-on-surface-variant">/mo</span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                    <Check size={14} className="text-secondary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <button className="w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                  Manage Subscription
                </button>
                <button className="w-full rounded-xl border border-outline-variant/30 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary">
                  Switch to Annual (Save 20%)
                </button>
              </div>
            </div>
          </Card>

          {/* Resource Allocation */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <HardDrive size={16} className="text-on-surface-variant" />
              <h3 className="font-headline font-bold text-on-surface">
                Resource Allocation
              </h3>
            </div>
            <div className="space-y-5">
              <ProgressBar
                label="Storage"
                value={42}
                max={100}
                unit="GB"
                color="bg-gradient-to-r from-[#ffb780] to-[#d48441]"
              />
              <ProgressBar
                label="AI Credits"
                value={1840}
                max={3000}
                unit="credits"
                color="bg-secondary"
              />
            </div>
          </Card>

          {/* Support */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={16} className="text-on-surface-variant" />
              <h3 className="font-headline font-bold text-on-surface">
                Support
              </h3>
            </div>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <MessageSquare size={16} className="text-primary shrink-0" />
                Live Chat
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <BookOpen size={16} className="text-primary shrink-0" />
                Documentation
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
