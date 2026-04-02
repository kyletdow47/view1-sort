'use client'

import {
  User,
  Brain,
  Palette,
  Plug,
  CreditCard,
  Bell,
  Camera,
  Check,
  Upload,
  Key,
  Mail,
  Globe,
  Save,
  Loader2,
  Crown,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  Sliders,
  ListChecks,
  Lock,
  Image as ImageIcon,
  ArrowRight,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

/* ─────────────────────────────────────────────────────────────────────
   Types & Constants
───────────────────────────────────────────────────────────────────── */

type Section = 'profile' | 'ai-workspace' | 'branding' | 'integrations' | 'billing' | 'notifications'

interface NavSection {
  id: Section
  label: string
  icon: React.ElementType
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'ai-workspace',  label: 'AI Workspace',  icon: Brain },
  { id: 'branding',      label: 'Branding',      icon: Palette },
  { id: 'integrations',  label: 'Integrations',  icon: Plug },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

interface WizardStep {
  title: string
  description: string
  icon: React.ElementType
}

const WIZARD_STEPS: WizardStep[] = [
  { title: 'Camera Presets',      description: 'File format and typical scene types you shoot',             icon: Camera },
  { title: 'Teach Your Style',    description: 'Upload 10–20 keeper examples so AI learns your taste',     icon: ImageIcon },
  { title: 'Sorting Preferences', description: 'Minimum sharpness threshold, burst dedup sensitivity',     icon: Sliders },
  { title: 'Shot List Templates', description: 'Configure Wedding, Portrait, and Commercial defaults',     icon: ListChecks },
]

/* ─────────────────────────────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={18} className="text-primary" />
        <h2 className="font-headline font-bold text-lg text-on-surface">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-container-highest'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: Profile
───────────────────────────────────────────────────────────────────── */

function ProfileSection() {
  const { user } = useAuth()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwStatus, setPwStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [profileRes, wsRes] = await Promise.all([
          supabase.from('profiles').select('display_name,avatar_url').eq('id', user.id).single(),
          supabase
            .from('workspaces')
            .select('id,name')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single(),
        ])
        if (profileRes.data) {
          setDisplayName(profileRes.data.display_name ?? '')
          setAvatarUrl(profileRes.data.avatar_url)
          setAvatarPreview(profileRes.data.avatar_url)
        }
        if (wsRes.data) {
          setBusinessName(wsRes.data.name ?? '')
          setWorkspaceId(wsRes.data.id)
        }
      } finally {
        setLoading(false)
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
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
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
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [user, supabase, displayName, businessName, avatarUrl, workspaceId])

  const handlePasswordChange = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setPwStatus('error')
      return
    }
    setPwSaving(true)
    setPwStatus('idle')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwStatus('success')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPwStatus('idle')
        setShowPasswordForm(false)
      }, 3000)
    } catch {
      setPwStatus('error')
    } finally {
      setPwSaving(false)
    }
  }, [supabase, newPassword, confirmPassword])

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <SectionCard title="Profile" icon={User}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container overflow-hidden hover:border-primary/40 transition-colors"
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <Camera size={28} className="text-on-surface-variant/30" />
                  )}
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Upload Photo
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Fields grid */}
              <div className="flex-1 grid grid-cols-2 gap-4">
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
                    placeholder="Studio name"
                    className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <SectionLabel>Email</SectionLabel>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20">
                    <Mail size={14} className="text-on-surface-variant/50 shrink-0" />
                    <span className="text-sm text-on-surface truncate">{user?.email ?? '—'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <SectionLabel>Phone</SectionLabel>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <SectionLabel>Website</SectionLabel>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20 focus-within:ring-primary/50">
                <Globe size={14} className="text-on-surface-variant/50 shrink-0" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourstudio.com"
                  className="flex-1 bg-transparent text-sm text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <SectionLabel>Bio</SectionLabel>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description of your photography style…"
                rows={3}
                className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
              {saveStatus === 'success' && (
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <Check size={14} /> Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-error">{saveError}</span>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Password card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">Password</h2>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        {showPasswordForm && (
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <SectionLabel>New Password</SectionLabel>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 ring-1 ring-outline-variant/20 focus-within:ring-primary/50">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="flex-1 bg-transparent text-sm text-on-surface outline-none"
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <SectionLabel>Confirm Password</SectionLabel>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={pwSaving || !newPassword}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
              {pwStatus === 'success' && (
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <Check size={14} /> Password updated
                </span>
              )}
              {pwStatus === 'error' && (
                <span className="text-sm text-error">Passwords don't match or update failed</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: AI Workspace wizard
───────────────────────────────────────────────────────────────────── */

const SCENE_OPTIONS = ['Wedding', 'Portrait', 'Commercial', 'Real Estate', 'Travel', 'Event', 'Fashion', 'Architecture']
const SHOT_TEMPLATES: Record<string, string[]> = {
  Wedding:    ['First Look', 'Ceremony Details', 'Ring Exchange', 'First Kiss', 'Reception Entrance', 'First Dance', 'Cake Cutting', 'Couple Portraits'],
  Portrait:   ['Full Body', 'Mid Shot', 'Close Up', 'Environmental', 'Candid'],
  Commercial: ['Hero Shot', 'Detail Shot', 'In-Context', 'Lifestyle', 'White Background'],
}

function AIWorkspaceSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Step 1
  const [fileFormat, setFileFormat] = useState<'RAW' | 'JPEG' | 'Both'>('RAW')
  const [sceneTypes, setSceneTypes] = useState<string[]>(['Wedding'])

  // Step 2
  const [keeperCount, setKeeperCount] = useState(0)

  // Step 3
  const [sharpnessThreshold, setSharpnessThreshold] = useState(65)
  const [burstDedup, setBurstDedup] = useState(80)

  // Step 4
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  const toggleScene = (scene: string) =>
    setSceneTypes((prev) =>
      prev.includes(scene) ? prev.filter((s) => s !== scene) : [...prev, scene],
    )

  const markComplete = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
    setActiveStep(null)
  }

  const completionPct = Math.round((completedSteps.size / WIZARD_STEPS.length) * 100)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Set Up Your AI Workspace
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-5">
          Complete these steps so the AI understands your shooting style and preferences.
        </p>

        {/* Progress bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-on-surface-variant/70">
            <span>{completedSteps.size} of {WIZARD_STEPS.length} steps complete</span>
            <span className="font-medium text-primary">{completionPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dim transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {WIZARD_STEPS.map((step, i) => {
            const isComplete = completedSteps.has(i)
            const isOpen = activeStep === i
            const StepIcon = step.icon

            return (
              <div
                key={i}
                className={`rounded-xl border transition-all ${
                  isOpen
                    ? 'border-primary/40 bg-surface-container'
                    : 'border-outline-variant/20 bg-surface-container/50'
                }`}
              >
                {/* Step header */}
                <button
                  onClick={() => setActiveStep(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 px-4 py-3.5"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isComplete
                        ? 'bg-green-500/20 text-green-400'
                        : isOpen
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-container-highest text-on-surface-variant/50'
                    }`}
                  >
                    {isComplete ? <Check size={16} /> : <StepIcon size={16} />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-semibold ${isOpen ? 'text-on-surface' : 'text-on-surface'}`}>
                      Step {i + 1}: {step.title}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-0.5">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isComplete && !isOpen && (
                      <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      className={`text-on-surface-variant/40 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {/* Step body */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-outline-variant/20">
                    {i === 0 && (
                      <div className="space-y-4 mt-3">
                        <div className="space-y-1.5">
                          <SectionLabel>File Format</SectionLabel>
                          <div className="flex gap-2">
                            {(['RAW', 'JPEG', 'Both'] as const).map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => setFileFormat(fmt)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                  fileFormat === fmt
                                    ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary'
                                    : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30'
                                }`}
                              >
                                {fmt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <SectionLabel>Scene Types You Shoot</SectionLabel>
                          <div className="flex flex-wrap gap-2">
                            {SCENE_OPTIONS.map((scene) => (
                              <button
                                key={scene}
                                onClick={() => toggleScene(scene)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  sceneTypes.includes(scene)
                                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                                    : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30'
                                }`}
                              >
                                {scene}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => markComplete(0)}
                          disabled={sceneTypes.length === 0}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <Check size={14} /> Save Presets
                        </button>
                      </div>
                    )}

                    {i === 1 && (
                      <div className="space-y-4 mt-3">
                        <p className="text-sm text-on-surface-variant">
                          Upload 10–20 of your best photos from past shoots. The AI will analyze your
                          selections to learn which shots you consider keepers.
                        </p>
                        <button
                          onClick={() => setKeeperCount((c) => Math.min(c + 5, 20))}
                          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-outline-variant/30 p-6 text-center hover:border-primary/40 transition-colors"
                        >
                          <Upload size={24} className="text-on-surface-variant/40" />
                          <p className="text-sm text-on-surface-variant">Click to upload keeper examples</p>
                          <p className="text-xs text-on-surface-variant/50">JPG, RAW — up to 20 photos</p>
                        </button>
                        {keeperCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-on-surface">
                            <Check size={14} className="text-green-400" />
                            <span>{keeperCount} photos uploaded</span>
                            {keeperCount < 10 && (
                              <span className="text-on-surface-variant/50">
                                ({10 - keeperCount} more recommended)
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => markComplete(1)}
                          disabled={keeperCount < 5}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <Brain size={14} /> Train AI on My Style
                        </button>
                      </div>
                    )}

                    {i === 2 && (
                      <div className="space-y-5 mt-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <SectionLabel>Minimum Sharpness Threshold</SectionLabel>
                            <span className="text-xs font-medium text-primary">{sharpnessThreshold}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={sharpnessThreshold}
                            onChange={(e) => setSharpnessThreshold(Number(e.target.value))}
                            className="w-full accent-[#4f46e5]"
                          />
                          <div className="flex justify-between text-[10px] text-on-surface-variant/50">
                            <span>Accept soft shots</span>
                            <span>Sharp only</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <SectionLabel>Burst Dedup Sensitivity</SectionLabel>
                            <span className="text-xs font-medium text-primary">{burstDedup}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={burstDedup}
                            onChange={(e) => setBurstDedup(Number(e.target.value))}
                            className="w-full accent-[#4f46e5]"
                          />
                          <div className="flex justify-between text-[10px] text-on-surface-variant/50">
                            <span>Keep more variants</span>
                            <span>Strict dedup</span>
                          </div>
                        </div>
                        <button
                          onClick={() => markComplete(2)}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                        >
                          <Check size={14} /> Save Preferences
                        </button>
                      </div>
                    )}

                    {i === 3 && (
                      <div className="space-y-4 mt-3">
                        <p className="text-sm text-on-surface-variant">
                          Select which shot list templates to configure. These define required and
                          optional shots the AI will look for in each shoot type.
                        </p>
                        <div className="space-y-2">
                          {Object.keys(SHOT_TEMPLATES).map((tpl) => (
                            <button
                              key={tpl}
                              onClick={() => setActiveTemplate(activeTemplate === tpl ? null : tpl)}
                              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                                activeTemplate === tpl
                                  ? 'bg-primary/10 ring-1 ring-primary/30'
                                  : 'bg-surface-container ring-1 ring-outline-variant/20 hover:ring-primary/30'
                              }`}
                            >
                              <span className="text-sm font-medium text-on-surface">{tpl} Template</span>
                              <ChevronRight
                                size={16}
                                className={`text-on-surface-variant/40 transition-transform ${
                                  activeTemplate === tpl ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {activeTemplate && SHOT_TEMPLATES[activeTemplate] && (
                          <div className="rounded-lg bg-surface-container p-4 space-y-2">
                            <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wide mb-3">
                              {activeTemplate} — Default Shots
                            </p>
                            {SHOT_TEMPLATES[activeTemplate].map((shot) => (
                              <div key={shot} className="flex items-center gap-2 text-sm text-on-surface">
                                <Check size={12} className="text-primary shrink-0" />
                                {shot}
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => markComplete(3)}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                        >
                          <Check size={14} /> Save Templates
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {completedSteps.size === WIZARD_STEPS.length && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
            <CheckCircle2 size={18} className="text-green-400 shrink-0" />
            <p className="text-sm text-green-400 font-medium">
              AI workspace fully configured — your AI is ready to sort!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: Branding
───────────────────────────────────────────────────────────────────── */

const BRAND_PRESET_COLORS = [
  '#5749F4', '#4f46e5', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#7c3aed', '#db2777',
]

function BrandingSection() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('My Photography Studio')
  const [accentColor, setAccentColor] = useState('#5749F4')
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Branding" icon={Palette}>
        <div className="space-y-6">
          {/* Logo upload */}
          <div className="space-y-2">
            <SectionLabel>Studio Logo</SectionLabel>
            <p className="text-xs text-on-surface-variant/60">
              Used in client galleries, emails, and watermarks
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="relative flex h-24 w-40 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container overflow-hidden hover:border-primary/40 transition-colors"
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Studio logo"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-on-surface-variant/30">
                    <Upload size={24} />
                    <span className="text-[11px]">Upload Logo</span>
                  </div>
                )}
              </button>
              <div className="space-y-1.5 text-xs text-on-surface-variant/60">
                <p>Recommended: SVG or PNG with transparent background</p>
                <p>Minimum size: 200×80px</p>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="text-primary font-medium hover:underline"
                >
                  Browse files
                </button>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Business name */}
          <div className="space-y-1.5">
            <SectionLabel>Business Display Name</SectionLabel>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
            />
          </div>

          {/* Accent color */}
          <div className="space-y-2">
            <SectionLabel>Brand Accent Color</SectionLabel>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {BRAND_PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      accentColor === color
                        ? 'ring-2 ring-offset-2 ring-offset-surface-container-low ring-white/40 scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 ring-1 ring-outline-variant/20">
                <div className="h-4 w-4 rounded" style={{ backgroundColor: accentColor }} />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-20 bg-transparent font-mono text-sm text-on-surface outline-none"
                />
              </div>
            </div>
          </div>

          {/* Email signature preview */}
          <div className="space-y-2">
            <SectionLabel>Email Signature Preview</SectionLabel>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-4">
              <div className="flex items-start gap-3">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={40}
                    height={40}
                    className="rounded object-contain"
                    unoptimized
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Camera size={18} style={{ color: accentColor }} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-on-surface">{businessName}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Professional Photography</p>
                  <div
                    className="mt-2 flex items-center gap-1 text-[11px]"
                    style={{ color: accentColor }}
                  >
                    <Globe size={11} />
                    <span>view1.studio/{businessName.toLowerCase().replace(/\s+/g, '-') || 'your-studio'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            <Save size={14} /> Save Branding
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: Integrations
───────────────────────────────────────────────────────────────────── */

interface IntegrationState {
  connected: boolean
  loading: boolean
  error: string | null
}

function IntegrationCard({
  title,
  description,
  icon: Icon,
  connected,
  loading,
  onConnect,
  onDisconnect,
  children,
}: {
  title: string
  description: string
  icon: React.ElementType
  connected: boolean
  loading?: boolean
  onConnect: () => void
  onDisconnect?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container/50 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            connected
              ? 'bg-green-500/15 text-green-400'
              : 'bg-surface-container-highest text-on-surface-variant/50'
          }`}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-on-surface">{title}</p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">{description}</p>
            </div>
            <div className="shrink-0">
              {connected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400">
                    <Check size={10} /> Connected
                  </span>
                  {onDisconnect && (
                    <button
                      onClick={onDisconnect}
                      className="text-xs text-on-surface-variant/50 hover:text-error transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onConnect}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Plug size={12} />}
                  {loading ? 'Connecting…' : 'Connect'}
                </button>
              )}
            </div>
          </div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  )
}

function IntegrationsSection() {
  const [stripeState, setStripeState] = useState<IntegrationState>({ connected: false, loading: false, error: null })

  const [cfToken, setCfToken] = useState('')
  const [cfAccountId, setCfAccountId] = useState('')
  const [cfState, setCfState] = useState<IntegrationState>({ connected: false, loading: false, error: null })

  const [resendKey, setResendKey] = useState('')
  const [resendFrom, setResendFrom] = useState('')
  const [resendState, setResendState] = useState<IntegrationState>({ connected: false, loading: false, error: null })

  const [hsKey, setHsKey] = useState('')
  const [hsState, setHsState] = useState<IntegrationState>({ connected: false, loading: false, error: null })

  const testCf = () => {
    setCfState((s) => ({ ...s, loading: true, error: null }))
    setTimeout(() => {
      if (cfToken && cfAccountId) {
        setCfState({ connected: true, loading: false, error: null })
      } else {
        setCfState({ connected: false, loading: false, error: 'Missing API token or account ID' })
      }
    }, 1200)
  }

  const testResend = () => {
    setResendState((s) => ({ ...s, loading: true, error: null }))
    setTimeout(() => {
      if (resendKey && resendFrom) {
        setResendState({ connected: true, loading: false, error: null })
      } else {
        setResendState({ connected: false, loading: false, error: 'Missing API key or from address' })
      }
    }, 1200)
  }

  const testHs = () => {
    setHsState((s) => ({ ...s, loading: true, error: null }))
    setTimeout(() => {
      if (hsKey) {
        setHsState({ connected: true, loading: false, error: null })
      } else {
        setHsState({ connected: false, loading: false, error: 'API key is required' })
      }
    }, 1200)
  }

  return (
    <SectionCard title="Integrations" icon={Plug}>
      <div className="space-y-4">
        {/* Stripe Connect */}
        <IntegrationCard
          title="Stripe Connect"
          description="Accept payments and payouts from client galleries"
          icon={CreditCard}
          connected={stripeState.connected}
          loading={stripeState.loading}
          onConnect={() => {
            setStripeState((s) => ({ ...s, loading: true }))
            setTimeout(() => setStripeState({ connected: true, loading: false, error: null }), 1500)
          }}
          onDisconnect={() => setStripeState({ connected: false, loading: false, error: null })}
        >
          {stripeState.connected && (
            <div className="rounded-lg bg-surface-container p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Payout account</span>
                <span className="text-on-surface font-medium">••••4242</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Next payout</span>
                <span className="text-on-surface font-medium">Rolling daily</span>
              </div>
              <button className="mt-1 flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                <ExternalLink size={11} /> Stripe Dashboard
              </button>
            </div>
          )}
        </IntegrationCard>

        {/* Cloudflare Images */}
        <IntegrationCard
          title="Cloudflare Images"
          description="CDN delivery, transforms, thumbnails, and watermarking"
          icon={ImageIcon}
          connected={cfState.connected}
          loading={cfState.loading}
          onConnect={testCf}
          onDisconnect={() => {
            setCfState({ connected: false, loading: false, error: null })
            setCfToken('')
            setCfAccountId('')
          }}
        >
          {!cfState.connected && (
            <div className="space-y-2">
              <input
                type="password"
                value={cfToken}
                onChange={(e) => setCfToken(e.target.value)}
                placeholder="API Token"
                className="w-full rounded-lg bg-surface-container px-3 py-2 font-mono text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
              <input
                type="text"
                value={cfAccountId}
                onChange={(e) => setCfAccountId(e.target.value)}
                placeholder="Account ID"
                className="w-full rounded-lg bg-surface-container px-3 py-2 font-mono text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
              {cfState.error && (
                <p className="flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {cfState.error}
                </p>
              )}
            </div>
          )}
        </IntegrationCard>

        {/* Resend */}
        <IntegrationCard
          title="Email (Resend)"
          description="Transactional emails — delivery notifications and client gallery links"
          icon={Mail}
          connected={resendState.connected}
          loading={resendState.loading}
          onConnect={testResend}
          onDisconnect={() => {
            setResendState({ connected: false, loading: false, error: null })
            setResendKey('')
            setResendFrom('')
          }}
        >
          {!resendState.connected && (
            <div className="space-y-2">
              <input
                type="password"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_xxxxxxxxxxxx (API Key)"
                className="w-full rounded-lg bg-surface-container px-3 py-2 font-mono text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
              <input
                type="email"
                value={resendFrom}
                onChange={(e) => setResendFrom(e.target.value)}
                placeholder="noreply@yourstudio.com"
                className="w-full rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
              {resendState.error && (
                <p className="flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {resendState.error}
                </p>
              )}
            </div>
          )}
        </IntegrationCard>

        {/* HelloSign */}
        <IntegrationCard
          title="HelloSign (Dropbox Sign)"
          description="E-signatures for contracts — send, track, and store signed documents"
          icon={Shield}
          connected={hsState.connected}
          loading={hsState.loading}
          onConnect={testHs}
          onDisconnect={() => {
            setHsState({ connected: false, loading: false, error: null })
            setHsKey('')
          }}
        >
          {!hsState.connected && (
            <div className="space-y-2">
              <input
                type="password"
                value={hsKey}
                onChange={(e) => setHsKey(e.target.value)}
                placeholder="HelloSign API Key"
                className="w-full rounded-lg bg-surface-container px-3 py-2 font-mono text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
              />
              {hsState.error && (
                <p className="flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {hsState.error}
                </p>
              )}
            </div>
          )}
        </IntegrationCard>
      </div>
    </SectionCard>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: Billing
───────────────────────────────────────────────────────────────────── */

const PLAN_FEATURES = [
  'Unlimited Projects',
  'AI Sorting (3,000 credits/mo)',
  'Custom Client Galleries',
  'Stripe Connect Integration',
  'Priority Support',
  'Custom Branding',
]

const USAGE_METERS = [
  { label: 'Photos Processed', value: 2847, max: 10000, unit: 'photos', color: 'from-primary to-primary-dim' },
  { label: 'Active Galleries',  value: 12,   max: 50,    unit: 'galleries', color: 'from-sky-500 to-sky-600' },
  { label: 'Storage Used',      value: 42,   max: 100,   unit: 'GB',        color: 'from-violet-500 to-violet-600' },
  { label: 'AI Credits',        value: 1840, max: 3000,  unit: 'credits',   color: 'from-amber-500 to-amber-600' },
]

function BillingSection() {
  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (res.ok && data.url) window.location.href = data.url
    } catch (err) {
      console.error('Billing portal error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary-dim/10 blur-3xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <Crown size={18} className="text-primary" />
            <SectionLabel>Current Plan</SectionLabel>
          </div>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">Pro Studio</h3>
          <div className="mb-5 mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-primary">$39</span>
            <span className="text-sm text-on-surface-variant">/mo</span>
          </div>
          <ul className="mb-6 space-y-2.5">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                <Check size={14} className="shrink-0 text-green-400" />
                {f}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              {portalLoading ? 'Loading…' : 'Manage Subscription'}
            </button>
            <button className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary">
              Switch to Annual (Save 20%)
            </button>
          </div>
        </div>
      </div>

      {/* Usage meters */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
        <div className="mb-5 flex items-center gap-2">
          <HardDrive size={18} className="text-primary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">Usage This Month</h2>
        </div>
        <div className="space-y-5">
          {USAGE_METERS.map(({ label, value, max, unit, color }) => {
            const pct = Math.round((value / max) * 100)
            return (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">{label}</span>
                  <span className="text-xs text-on-surface-variant">
                    {value.toLocaleString()} / {max.toLocaleString()} {unit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <Zap size={20} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-on-surface">Need more capacity?</p>
            <p className="mt-1 text-xs text-on-surface-variant/70">
              Upgrade to Studio plan for unlimited photos, 10 TB storage, and priority AI processing.
            </p>
            <button className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
              View Studio Plan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Section: Notifications
───────────────────────────────────────────────────────────────────── */

interface NotifPrefs {
  booking_email: boolean
  booking_push: boolean
  payment_email: boolean
  payment_push: boolean
  gallery_email: boolean
  gallery_push: boolean
  ai_email: boolean
  ai_push: boolean
  weekly_digest: boolean
  marketing: boolean
}

const NOTIF_GROUPS: Array<{
  title: string
  rows: Array<{ label: string; description: string; emailKey: keyof NotifPrefs; pushKey: keyof NotifPrefs }>
}> = [
  {
    title: 'Bookings',
    rows: [{
      label: 'New booking requests',
      description: 'When a client submits a booking form',
      emailKey: 'booking_email',
      pushKey: 'booking_push',
    }],
  },
  {
    title: 'Payments',
    rows: [{
      label: 'Payment received',
      description: 'When a client pays for a gallery or package',
      emailKey: 'payment_email',
      pushKey: 'payment_push',
    }],
  },
  {
    title: 'Galleries',
    rows: [{
      label: 'Gallery viewed',
      description: 'When a client opens their gallery link',
      emailKey: 'gallery_email',
      pushKey: 'gallery_push',
    }],
  },
  {
    title: 'AI Processing',
    rows: [{
      label: 'Sort complete',
      description: 'When AI finishes processing a batch',
      emailKey: 'ai_email',
      pushKey: 'ai_push',
    }],
  },
]

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    booking_email: true,
    booking_push: true,
    payment_email: true,
    payment_push: false,
    gallery_email: false,
    gallery_push: true,
    ai_email: true,
    ai_push: false,
    weekly_digest: true,
    marketing: false,
  })

  const toggle = (key: keyof NotifPrefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <SectionCard title="Notifications" icon={Bell}>
      <div className="space-y-6">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-center pb-2 border-b border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface-variant/50">Notification</span>
          <span className="w-16 text-center text-xs font-medium text-on-surface-variant/50">Email</span>
          <span className="w-16 text-center text-xs font-medium text-on-surface-variant/50">Push</span>
        </div>

        {NOTIF_GROUPS.map(({ title, rows }) => (
          <div key={title}>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant/60">
              {title}
            </p>
            {rows.map(({ label, description, emailKey, pushKey }) => (
              <div key={label} className="grid grid-cols-[1fr,auto,auto] gap-4 items-center py-2.5">
                <div>
                  <p className="text-sm text-on-surface">{label}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant/50">{description}</p>
                </div>
                <div className="flex w-16 justify-center">
                  <Toggle checked={prefs[emailKey]} onToggle={() => toggle(emailKey)} />
                </div>
                <div className="flex w-16 justify-center">
                  <Toggle checked={prefs[pushKey]} onToggle={() => toggle(pushKey)} />
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* General */}
        <div className="space-y-3 border-t border-outline-variant/20 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant/60">
            General
          </p>
          {([
            { key: 'weekly_digest' as const, label: 'Weekly digest',   desc: 'Summary of your activity every Monday' },
            { key: 'marketing'     as const, label: 'Product updates', desc: 'New features, tips, and announcements' },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm text-on-surface">{label}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant/50">{desc}</p>
              </div>
              <Toggle checked={prefs[key]} onToggle={() => toggle(key)} />
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </SectionCard>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your account, AI workspace, branding, and integrations
        </p>
      </div>

      {/* Sidebar + content */}
      <div className="flex gap-6 items-start">
        {/* Left sidebar nav */}
        <nav className="w-48 shrink-0 sticky top-24 space-y-1">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'bg-surface-container text-primary'
                  : 'text-on-surface/50 hover:bg-surface-container/60 hover:text-on-surface'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="min-w-0 flex-1">
          {activeSection === 'profile'       && <ProfileSection />}
          {activeSection === 'ai-workspace'  && <AIWorkspaceSection />}
          {activeSection === 'branding'      && <BrandingSection />}
          {activeSection === 'integrations'  && <IntegrationsSection />}
          {activeSection === 'billing'       && <BillingSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}
