'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Brain,
  BarChart2,
  Trash2,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  loadStyleProfile,
  progressToUnlock,
  topCategories,
  UNLOCK_THRESHOLD,
  type StyleProfile,
} from '@/lib/ai/style-profile'
import { getAllPresets } from '@/lib/ai/presets'

/* ─── Weight bar ─────────────────────────────────────────────────────────── */

function WeightBar({ label, weight }: { label: string; weight: number }) {
  // weight is 0.2–2.0; normalize to 0–100%
  const pct = Math.round(((weight - 0.2) / 1.8) * 100)
  const color =
    weight >= 1.4
      ? 'bg-emerald-500'
      : weight >= 0.8
        ? 'bg-primary'
        : 'bg-red-500/60'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-on-surface-variant/70 w-32 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-on-surface-variant/50 w-8 text-right">
        {weight.toFixed(1)}×
      </span>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

export default function AIProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<StyleProfile | null>(null)
  const [cleared, setCleared] = useState(false)

  const presets = getAllPresets()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id
      if (uid) {
        setUserId(uid)
        setProfile(loadStyleProfile(uid))
      }
    })
  }, [])

  const clearProfile = () => {
    if (!userId) return
    localStorage.removeItem(`v1-style-profile:${userId}`)
    setProfile(loadStyleProfile(userId))
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const progress = profile ? progressToUnlock(profile) : 0
  const unlocked = profile?.personalizedModeUnlocked ?? false
  const feedbackCount = profile?.feedbackCount ?? 0

  // Group weights by preset
  const weightsByPreset = presets.map((p) => {
    const cats = topCategories(profile ?? { userId: '', feedbackCount: 0, personalizedModeUnlocked: false, categoryWeights: {}, lastUpdated: 0 }, p.id, 8)
    const weights = cats.map((cat) => ({
      cat,
      weight: profile?.categoryWeights[`${p.id}:${cat}`] ?? 1.0,
    }))
    return { preset: p, weights }
  }).filter((x) => x.weights.length > 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Style Profile
          </h1>
          <p className="text-on-surface-variant/60 font-body mt-1 text-sm">
            The more you sort and provide feedback, the smarter the AI becomes for your style.
          </p>
        </div>
        <Link
          href="/dashboard/ai-sort"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Sort photos
        </Link>
      </div>

      {/* Personalized Mode status */}
      <div className={[
        'rounded-3xl p-6 border-2 transition-all',
        unlocked
          ? 'border-primary/40 bg-primary/5'
          : 'border-outline-variant/20 bg-surface-container-low',
      ].join(' ')}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={['w-12 h-12 rounded-2xl flex items-center justify-center', unlocked ? 'bg-primary/20' : 'bg-surface-container'].join(' ')}>
              {unlocked ? (
                <Unlock className="w-6 h-6 text-primary" />
              ) : (
                <Lock className="w-6 h-6 text-on-surface-variant/40" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-on-surface text-lg">Personalized Mode</h2>
                {unlocked && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-sm text-on-surface-variant/60 mt-0.5">
                {unlocked
                  ? 'The AI now adjusts sort results based on your historical preferences.'
                  : `Sort and rate ${UNLOCK_THRESHOLD - feedbackCount} more photos to unlock personalized sorting.`}
              </p>
            </div>
          </div>

          {unlocked && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />}
        </div>

        {/* Progress bar */}
        {!unlocked && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest">
              <span>Progress to unlock</span>
              <span>{feedbackCount} / {UNLOCK_THRESHOLD}</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Feedback events', value: feedbackCount, icon: BarChart2 },
          { label: 'Categories learned', value: Object.keys(profile?.categoryWeights ?? {}).length, icon: Brain },
          { label: 'Presets trained', value: weightsByPreset.length, icon: Sparkles },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-on-surface">{s.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category weights */}
      {weightsByPreset.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-on-surface-variant/50">
            Learned category weights
          </h2>
          {weightsByPreset.map(({ preset, weights }) => (
            <div key={preset.id} className="bg-surface-container rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{preset.icon}</span>
                <h3 className="font-headline font-bold text-on-surface">{preset.name}</h3>
                <span className="text-[10px] font-mono text-on-surface-variant/40">{weights.length} categories</span>
              </div>
              <div className="space-y-2">
                {weights.map(({ cat, weight }) => (
                  <WeightBar key={cat} label={cat} weight={weight} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container rounded-2xl p-8 text-center space-y-3">
          <Brain className="w-10 h-10 text-on-surface-variant/20 mx-auto" />
          <p className="text-sm font-headline font-bold text-on-surface-variant/50">No learning data yet</p>
          <p className="text-xs text-on-surface-variant/40 max-w-xs mx-auto">
            Sort some photos and accept or reject category assignments to start training your style profile.
          </p>
          <Link
            href="/dashboard/ai-sort"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-headline font-bold hover:bg-primary/20 transition-colors mt-2"
          >
            Start sorting
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Reset */}
      {feedbackCount > 0 && (
        <div className="flex items-center justify-between p-5 bg-surface-container rounded-2xl border border-outline-variant/20">
          <div>
            <p className="font-headline font-bold text-on-surface text-sm">Reset style profile</p>
            <p className="text-xs text-on-surface-variant/50 mt-0.5">
              Clear all learned weights and feedback data. This cannot be undone.
            </p>
          </div>
          <button
            onClick={clearProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-headline font-bold hover:bg-red-500/20 transition-colors"
          >
            {cleared ? <CheckCircle2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            {cleared ? 'Cleared' : 'Reset'}
          </button>
        </div>
      )}
    </div>
  )
}
