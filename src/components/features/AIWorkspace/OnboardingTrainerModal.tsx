'use client'

import { useEffect } from 'react'
import { Check, X, Sparkles, GraduationCap, Zap } from 'lucide-react'

import { useOnboardingTrainer } from '@/hooks/useOnboardingTrainer'
import { getPreset } from '@/lib/ai/presets'
import { TRAINER_PHOTO_COUNT } from '@/types/onboarding-trainer'

export interface OnboardingTrainerModalProps {
  userId: string | undefined
  presetId: string | undefined
  onClose: () => void
}

/**
 * Full-screen modal that runs the 20-photo quick-sort trainer.
 * Opens on first preset selection and seeds the user's StyleProfile
 * with keep/reject feedback before their first real sort.
 */
export function OnboardingTrainerModal({
  userId,
  presetId,
  onClose,
}: OnboardingTrainerModalProps) {
  const trainer = useOnboardingTrainer({ userId, presetId })
  const preset = presetId ? getPreset(presetId) : undefined

  // Keyboard shortcuts: ← reject, → keep, Esc close.
  useEffect(() => {
    if (!trainer.shouldRun) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') trainer.decide('reject')
      else if (e.key === 'ArrowRight') trainer.decide('keep')
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [trainer, onClose])

  // Auto-close shortly after completion so the success splash reads.
  useEffect(() => {
    if (!trainer.completed) return
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [trainer.completed, onClose])

  if (!trainer.shouldRun && !trainer.completed) return null

  const current = trainer.photos[trainer.index]
  const progress = trainer.total > 0 ? (trainer.index / trainer.total) * 100 : 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding trainer"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl border border-white/10
          bg-[#0C0C14] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5749F4]/20 border border-[#5749F4]/30 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold font-[Geist,sans-serif]">
                Teach the AI your eye
              </h2>
              <p className="text-white/50 text-xs font-[Geist,sans-serif] mt-0.5">
                {preset?.name ?? 'Preset'} · quick-sort {TRAINER_PHOTO_COUNT} photos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={trainer.skip}
            className="text-white/40 hover:text-white/70 text-xs font-[Geist,sans-serif] transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* ─── Progress ────────────────────────────────────────────── */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs text-white/50 font-[Geist,sans-serif] mb-2">
            <span>
              {trainer.completed
                ? 'Complete'
                : `${trainer.index} of ${trainer.total || TRAINER_PHOTO_COUNT}`}
            </span>
            <span className="text-white/30">← Reject · Keep →</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5749F4] to-[#818CF8] transition-all duration-300"
              style={{ width: `${trainer.completed ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────── */}
        <div className="p-6">
          {trainer.loading ? (
            <div className="aspect-[4/3] rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white/30" />
            </div>
          ) : trainer.error ? (
            <ErrorState message={trainer.error} onClose={onClose} />
          ) : trainer.completed ? (
            <CompletedState decisionCount={trainer.decisions.length} />
          ) : current ? (
            <TrainerPhotoCard
              photoUrl={current.url}
              category={current.category}
              credit={current.credit}
              creditUrl={current.creditUrl}
              onKeep={() => trainer.decide('keep')}
              onReject={() => trainer.decide('reject')}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ─── Photo card ────────────────────────────────────────────────────── */

interface TrainerPhotoCardProps {
  photoUrl: string
  category: string
  credit: string
  creditUrl: string
  onKeep: () => void
  onReject: () => void
}

function TrainerPhotoCard({
  photoUrl,
  category,
  credit,
  creditUrl,
  onKeep,
  onReject,
}: TrainerPhotoCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={category}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/15">
          <span className="text-[11px] text-white/80 font-medium font-[Geist,sans-serif]">
            {category}
          </span>
        </div>
        <a
          href={creditUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[10px] text-white/50 hover:text-white/80 font-[Geist,sans-serif]"
        >
          © {credit}
        </a>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReject}
          className="flex-1 h-12 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 font-medium font-[Geist,sans-serif] text-sm transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
        <button
          type="button"
          onClick={onKeep}
          className="flex-1 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 font-medium font-[Geist,sans-serif] text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Keep
        </button>
      </div>

      <p className="text-center text-[11px] text-white/30 font-[Geist,sans-serif]">
        Would you keep a photo like this in your final gallery?
      </p>
    </div>
  )
}

/* ─── Completed splash ─────────────────────────────────────────────── */

function CompletedState({ decisionCount }: { decisionCount: number }) {
  return (
    <div className="py-10 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <Zap className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-white text-lg font-semibold font-[Geist,sans-serif]">
          Library seeded
        </h3>
        <p className="text-white/50 text-sm font-[Geist,sans-serif] mt-1 max-w-md">
          {decisionCount} decisions recorded. Your first sort will already lean
          toward photos you&rsquo;d keep.
        </p>
      </div>
    </div>
  )
}

/* ─── Error state ───────────────────────────────────────────────────── */

function ErrorState({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="py-10 flex flex-col items-center text-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
        <X className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <h3 className="text-white text-base font-semibold font-[Geist,sans-serif]">
          Couldn&rsquo;t load the trainer
        </h3>
        <p className="text-white/50 text-xs font-[Geist,sans-serif] mt-1">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="h-9 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-[Geist,sans-serif] transition-colors"
      >
        Continue
      </button>
    </div>
  )
}
