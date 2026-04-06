'use client'

import {
  Camera,
  Mail,
  Globe,
  Phone,
  MapPin,
  AtSign,
  ChevronDown,
  Zap,
  Trash2,
  Check,
  Loader2,
  Link,
  AlertCircle,
} from 'lucide-react'
import {
  useState,
  useRef,
  useCallback,
  useTransition,
} from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type FieldStatus = 'idle' | 'saving' | 'saved' | 'error'

interface FieldState {
  status: FieldStatus
  error?: string
}

interface SocialLinks {
  instagram: string
  facebook: string
  tiktok: string
}

export interface ProfileEditorViewProps {
  initialDisplayName?: string
  initialBusinessName?: string
  initialAvatarUrl?: string | null
  initialWorkspaceId?: string | null
}

// TODO(db-migration): Add these columns to the profiles table:
//   phone        TEXT
//   bio          TEXT
//   website_url  TEXT
//   location     TEXT
//   instagram    TEXT
//   facebook     TEXT
//   tiktok       TEXT
// Run: npx supabase migration new add_profile_extended_fields
// Then: npx supabase gen types typescript --local > src/types/supabase.ts

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const BIO_MAX = 500
const CURRENCIES = ['USD', 'EUR', 'GBP'] as const
type Currency = (typeof CURRENCIES)[number]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function isValidUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
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

function CardHeader({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-primary">{icon}</span>
      <h2 className="font-sans font-bold text-lg text-on-surface">{title}</h2>
    </div>
  )
}

function FieldStatusIndicator({ status }: { status: FieldStatus }) {
  if (status === 'idle') return null
  if (status === 'saving')
    return <Loader2 size={12} className="animate-spin text-on-surface-variant/50 flex-shrink-0" />
  if (status === 'saved')
    return <Check size={12} className="text-secondary flex-shrink-0" />
  if (status === 'error')
    return <AlertCircle size={12} className="text-error flex-shrink-0" />
  return null
}

function AutoSaveInput({
  label,
  value,
  onChange,
  onBlur,
  fieldStatus,
  placeholder,
  type = 'text',
  readOnly = false,
  prefix,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  fieldStatus: FieldStatus
  placeholder?: string
  type?: string
  readOnly?: boolean
  prefix?: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <FieldStatusIndicator status={fieldStatus} />
      </div>
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 ring-1 transition-colors ${
          readOnly
            ? 'bg-surface-container ring-outline-variant/10'
            : error
            ? 'bg-surface-container ring-error/50'
            : fieldStatus === 'saved'
            ? 'bg-surface-container ring-secondary/30'
            : 'bg-surface-container ring-outline-variant/20 focus-within:ring-primary/50'
        }`}
      >
        {prefix && (
          <span className="text-on-surface-variant/50 flex-shrink-0">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30 read-only:cursor-default"
        />
      </div>
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ProfileEditorView — Client Component                               */
/* ------------------------------------------------------------------ */

export function ProfileEditorView({
  initialDisplayName = '',
  initialBusinessName = '',
  initialAvatarUrl = null,
  initialWorkspaceId = null,
}: ProfileEditorViewProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  // ── Persisted fields (exist in DB) ────────────────────────────────
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl)
  const [workspaceId] = useState<string | null>(initialWorkspaceId)

  // ── Extended fields (TODO: DB migration needed) ───────────────────
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [location, setLocation] = useState('')
  const [social, setSocial] = useState<SocialLinks>({
    instagram: '',
    facebook: '',
    tiktok: '',
  })
  const [websiteError, setWebsiteError] = useState('')

  // ── Workflow preferences ──────────────────────────────────────────
  const [currency, setCurrency] = useState<Currency>('USD')
  const [sensitivity, setSensitivity] = useState(72)
  const [autoSync, setAutoSync] = useState(true)

  // ── Per-field save status ─────────────────────────────────────────
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({})
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ── Danger zone ───────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false)

  // ── Per-field auto-save helpers ───────────────────────────────────
  const setFieldStatus = useCallback((field: string, status: FieldStatus, error?: string) => {
    setFieldStates((prev) => ({ ...prev, [field]: { status, error } }))
  }, [])

  const flashSaved = useCallback(
    (field: string) => {
      setFieldStatus(field, 'saved')
      clearTimeout(savedTimers.current[field])
      savedTimers.current[field] = setTimeout(() => {
        setFieldStatus(field, 'idle')
      }, 2500)
    },
    [setFieldStatus],
  )

  const getStatus = (field: string): FieldStatus =>
    fieldStates[field]?.status ?? 'idle'

  // ── Save: display name ────────────────────────────────────────────
  const saveDisplayName = useCallback(async () => {
    if (!user) return
    setFieldStatus('displayName', 'saving')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', user.id)
      if (error) throw error
      flashSaved('displayName')
    } catch {
      setFieldStatus('displayName', 'error', 'Failed to save')
    }
  }, [user, supabase, displayName, setFieldStatus, flashSaved])

  // ── Save: business name ───────────────────────────────────────────
  const saveBusinessName = useCallback(async () => {
    if (!user || !workspaceId) return
    setFieldStatus('businessName', 'saving')
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name: businessName.trim() })
        .eq('id', workspaceId)
      if (error) throw error
      flashSaved('businessName')
    } catch {
      setFieldStatus('businessName', 'error', 'Failed to save')
    }
  }, [user, supabase, businessName, workspaceId, setFieldStatus, flashSaved])

  // ── Save: extended fields (TODO: DB migration) ────────────────────
  const saveMockField = useCallback(
    (field: string) => {
      // TODO(db-migration): persist to profiles table once columns exist
      setFieldStatus(field, 'saving')
      startTransition(() => {
        setTimeout(() => flashSaved(field), 400)
      })
    },
    [setFieldStatus, flashSaved, startTransition],
  )

  const savePhone = useCallback(() => saveMockField('phone'), [saveMockField])
  const saveBio = useCallback(() => saveMockField('bio'), [saveMockField])
  const saveLocation = useCallback(() => saveMockField('location'), [saveMockField])
  const saveSocial = useCallback(
    (handle: keyof SocialLinks) => saveMockField(`social.${handle}`),
    [saveMockField],
  )

  const saveWebsiteUrl = useCallback(() => {
    const valid = isValidUrl(websiteUrl)
    if (!valid) {
      setWebsiteError('Please enter a valid URL (e.g. https://yoursite.com)')
      return
    }
    setWebsiteError('')
    saveMockField('websiteUrl')
  }, [websiteUrl, saveMockField])

  // ── Avatar upload ─────────────────────────────────────────────────
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      setFieldStatus('avatar', 'saving')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (error) {
        setFieldStatus('avatar', 'error', 'Upload failed')
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      setAvatarUrl(publicUrl)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (updateError) {
        setFieldStatus('avatar', 'error', 'Failed to save avatar')
        return
      }
      flashSaved('avatar')
    },
    [user, supabase, setFieldStatus, flashSaved],
  )

  const handlePhoneChange = useCallback((raw: string) => {
    setPhone(formatPhone(raw))
  }, [])

  const portfolioSlug = businessName.toLowerCase().replace(/\s+/g, '-') || 'your-studio'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Page header ── */}
      <div>
        <h1 className="font-sans text-2xl font-extrabold text-on-surface">Profile</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your studio identity and public presence
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STUDIO IDENTITY
      ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader icon={<Camera size={18} />} title="Studio Identity" />

        <div className="flex items-start gap-6 mb-6">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container overflow-hidden hover:border-primary/50 transition-colors group"
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
                <Camera
                  size={28}
                  className="text-on-surface-variant/25 group-hover:text-primary/50 transition-colors"
                />
              )}
              {avatarPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              )}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Upload logo
              </button>
              <FieldStatusIndicator status={getStatus('avatar')} />
            </div>
            <p className="text-[10px] text-on-surface-variant/40">PNG · SVG · JPG</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Core identity fields */}
          <div className="flex-1 space-y-4">
            <AutoSaveInput
              label="Display Name"
              value={displayName}
              onChange={setDisplayName}
              onBlur={saveDisplayName}
              fieldStatus={getStatus('displayName')}
              placeholder="Your full name"
            />
            <AutoSaveInput
              label="Business Name"
              value={businessName}
              onChange={setBusinessName}
              onBlur={saveBusinessName}
              fieldStatus={getStatus('businessName')}
              placeholder="Your studio name"
            />
            <div className="space-y-1.5">
              <SectionLabel>Email</SectionLabel>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/10">
                <Mail size={14} className="text-on-surface-variant/40 flex-shrink-0" />
                <span className="text-sm text-on-surface/70 font-mono">
                  {user?.email ?? '—'}
                </span>
                <span className="ml-auto text-[10px] text-on-surface-variant/40 bg-surface-container-highest px-2 py-0.5 rounded">
                  read-only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary identity fields */}
        <div className="grid grid-cols-2 gap-4">
          <AutoSaveInput
            label="Phone"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={savePhone}
            fieldStatus={getStatus('phone')}
            placeholder="(555) 000-0000"
            prefix={<Phone size={14} />}
          />
          <AutoSaveInput
            label="Location"
            value={location}
            onChange={setLocation}
            onBlur={saveLocation}
            fieldStatus={getStatus('location')}
            placeholder="City, State"
            prefix={<MapPin size={14} />}
          />
        </div>

        {/* Portfolio URL — display only */}
        <div className="space-y-1.5 mt-4">
          <SectionLabel>Portfolio URL</SectionLabel>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/10">
            <Globe size={14} className="text-on-surface-variant/40 flex-shrink-0" />
            <span className="text-sm text-primary font-mono">
              view1.studio/{portfolioSlug}
            </span>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          ABOUT & ONLINE PRESENCE
      ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader icon={<Link size={18} />} title="About & Online Presence" />

        {/* Bio */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Bio</SectionLabel>
            <div className="flex items-center gap-2">
              <FieldStatusIndicator status={getStatus('bio')} />
              <span
                className={`font-mono text-[10px] ${
                  bio.length > BIO_MAX * 0.9
                    ? 'text-amber-400'
                    : 'text-on-surface-variant/40'
                }`}
              >
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            onBlur={saveBio}
            placeholder="Tell clients about your photography style, experience, and what makes your work unique…"
            rows={4}
            className="w-full resize-none rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50 placeholder:text-on-surface-variant/30 transition-colors"
          />
        </div>

        {/* Website URL */}
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <SectionLabel>Website</SectionLabel>
            <FieldStatusIndicator status={getStatus('websiteUrl')} />
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 ring-1 transition-colors ${
              websiteError
                ? 'bg-surface-container ring-error/40'
                : 'bg-surface-container ring-outline-variant/20 focus-within:ring-primary/50'
            }`}
          >
            <Globe size={14} className="text-on-surface-variant/40 flex-shrink-0" />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value)
                if (websiteError) setWebsiteError('')
              }}
              onBlur={saveWebsiteUrl}
              placeholder="https://yourstudio.com"
              className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30"
            />
          </div>
          {websiteError && (
            <p className="text-[11px] text-error flex items-center gap-1">
              <AlertCircle size={10} />
              {websiteError}
            </p>
          )}
        </div>

        {/* Social links */}
        <div className="space-y-3">
          <SectionLabel>Social Links</SectionLabel>

          {/* Instagram */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant/50">Instagram</span>
              <FieldStatusIndicator status={getStatus('social.instagram')} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20 focus-within:ring-primary/50 transition-colors">
              {/* Instagram — lucide-react doesn't export Instagram icon; using AtSign */}
              <AtSign size={14} className="text-on-surface-variant/40 flex-shrink-0" />
              <span className="text-sm text-on-surface-variant/50 select-none">@</span>
              <input
                type="text"
                value={social.instagram}
                onChange={(e) =>
                  setSocial((p) => ({ ...p, instagram: e.target.value.replace('@', '') }))
                }
                onBlur={() => saveSocial('instagram')}
                placeholder="yourstudio"
                className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant/50">Facebook</span>
              <FieldStatusIndicator status={getStatus('social.facebook')} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20 focus-within:ring-primary/50 transition-colors">
              {/* Facebook — lucide-react doesn't export Facebook icon; using AtSign */}
              <AtSign size={14} className="text-on-surface-variant/40 flex-shrink-0" />
              <span className="text-sm text-on-surface-variant/50 select-none">@</span>
              <input
                type="text"
                value={social.facebook}
                onChange={(e) =>
                  setSocial((p) => ({ ...p, facebook: e.target.value.replace('@', '') }))
                }
                onBlur={() => saveSocial('facebook')}
                placeholder="yourstudiopage"
                className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* TikTok */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant/50">TikTok</span>
              <FieldStatusIndicator status={getStatus('social.tiktok')} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20 focus-within:ring-primary/50 transition-colors">
              {/* TikTok not in lucide-react — using text badge */}
              <span className="text-on-surface-variant/40 text-[10px] font-bold flex-shrink-0 w-[14px] text-center">
                TT
              </span>
              <span className="text-sm text-on-surface-variant/50 select-none">@</span>
              <input
                type="text"
                value={social.tiktok}
                onChange={(e) =>
                  setSocial((p) => ({ ...p, tiktok: e.target.value.replace('@', '') }))
                }
                onBlur={() => saveSocial('tiktok')}
                placeholder="yourstudio"
                className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          GLOBAL WORKFLOW
      ══════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader icon={<Zap size={18} />} title="Global Workflow" />

        <div className="space-y-6">
          {/* Default Preset */}
          <div className="space-y-1.5">
            <SectionLabel>Default Sorting Preset</SectionLabel>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50 transition-colors">
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
          <div className="space-y-2">
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
              <span className="font-mono text-xs font-medium text-primary">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full accent-[var(--color-primary,#5749F4)]"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/50 font-mono">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          {/* Auto-Sync */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-secondary flex-shrink-0" />
              <div>
                <span className="text-sm text-on-surface">Auto-Sync to Cloud</span>
                <p className="text-[11px] text-on-surface-variant/50">
                  Automatically back up all projects in real-time
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              aria-checked={autoSync}
              role="switch"
              className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
                autoSync ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
                  autoSync ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          DANGER ZONE
      ══════════════════════════════════════════════════════════════ */}
      <Card className="border-red-500/20">
        <CardHeader icon={<Trash2 size={18} />} title="Danger Zone" />

        <div className="rounded-xl bg-surface-container p-4 ring-1 ring-outline-variant/20">
          <p className="text-sm font-medium text-on-surface mb-1">Delete Account</p>
          <p className="text-xs text-on-surface-variant/60 mb-3">
            Permanently delete your account and all associated data including projects,
            galleries, and client records. This action cannot be undone.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-error transition-colors hover:bg-red-500/15"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-error font-medium">
                Are you sure? This cannot be undone.
              </p>
              <button
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                onClick={() => {
                  // TODO: call DELETE /api/account route
                  setConfirmDelete(false)
                }}
              >
                Yes, delete permanently
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-on-surface-variant/60 hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
