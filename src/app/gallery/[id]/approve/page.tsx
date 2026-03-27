'use client'

import { use, useState } from 'react'
import {
  Camera,
  Check,
  Star,
  ArrowLeft,
  PartyPopper,
  Clock,
  Grid3X3,
  Palette,
  ImageIcon,
} from 'lucide-react'

interface ApprovePageProps {
  params: Promise<{ id: string }>
}

const NAV_TABS = ['Overview', 'Sorting', 'Selection', 'Delivery']

export default function ApprovePage({ params }: ApprovePageProps) {
  const { id } = use(params)
  const [activeTab] = useState('Delivery')
  const [checklist, setChecklist] = useState({
    reviewed: false,
    satisfied: false,
    understand: false,
  })
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const allChecked = checklist.reviewed && checklist.satisfied && checklist.understand

  function toggleCheck(key: keyof typeof checklist) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleApprove() {
    if (allChecked) {
      setIsCompleted(true)
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#151312]">
        {/* Top Nav */}
        <nav className="border-b border-[#534439]/30 bg-[#1d1b1a]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
                <Camera size={16} className="text-[#4e2600]" />
              </div>
              <span className="text-sm font-bold text-[#e7e1df]">PhotoSorter</span>
            </div>
          </div>
        </nav>

        {/* Confirmation State */}
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
          {/* Confetti-like decoration */}
          <div className="relative mb-6">
            <div className="absolute -left-6 -top-4 h-3 w-3 rotate-12 rounded-sm bg-[#ffb780]/60" />
            <div className="absolute -right-8 -top-2 h-2 w-2 -rotate-12 rounded-sm bg-[#95d1d1]/60" />
            <div className="absolute -left-10 top-6 h-2 w-2 rotate-45 rounded-sm bg-[#ffb4a5]/60" />
            <div className="absolute -right-4 top-10 h-3 w-3 -rotate-45 rounded-sm bg-[#ffb780]/40" />
            <div className="absolute -bottom-2 -left-4 h-2.5 w-2.5 rotate-30 rounded-full bg-[#95d1d1]/40" />
            <div className="absolute -bottom-4 right-0 h-2 w-2 rounded-full bg-[#e7765f]/50" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#95d1d1]/15">
              <PartyPopper size={36} className="text-[#95d1d1]" />
            </div>
          </div>

          <h1 className="font-headline text-3xl font-extrabold italic text-[#e7e1df]">
            Project Marked as Complete
          </h1>
          <p className="mt-3 text-sm text-[#d9c2b4]/60">
            Thank you for your approval! Your photographer has been notified.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#1d1b1a] px-4 py-2.5 border border-[#534439]/20">
            <Clock size={14} className="text-[#a18d80]/60" />
            <span className="text-xs text-[#d9c2b4]/50">
              Completed on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at{' '}
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {rating > 0 && (
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= rating ? 'fill-[#ffb780] text-[#ffb780]' : 'text-[#534439]'}
                />
              ))}
              <span className="ml-2 text-xs text-[#d9c2b4]/50">Your rating</span>
            </div>
          )}

          <a
            href={`/gallery/${id}`}
            className="mt-8 flex items-center gap-1.5 text-xs text-[#d9c2b4]/60 transition-colors hover:text-[#ffb780]"
          >
            <ArrowLeft size={14} />
            Back to Gallery
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151312]">
      {/* Top Nav */}
      <nav className="border-b border-[#534439]/30 bg-[#1d1b1a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
              <Camera size={16} className="text-[#4e2600]" />
            </div>
            <span className="text-sm font-bold text-[#e7e1df]">PhotoSorter</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  tab === activeTab
                    ? 'bg-[#ffb780]/15 text-[#ffb780]'
                    : 'text-[#d9c2b4]/60 hover:text-[#d9c2b4]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-extrabold italic text-[#e7e1df]">
            Review & Approve
          </h1>
          <p className="mt-1 text-sm text-[#d9c2b4]/70">Johnson Wedding</p>
        </div>

        {/* Summary Section */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
            Delivery Summary
          </span>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-xl bg-[#211f1e] p-4">
              <ImageIcon size={20} className="text-[#ffb780]/60" />
              <span className="mt-2 text-2xl font-bold text-[#e7e1df]">248</span>
              <span className="text-[10px] text-[#d9c2b4]/50">Photos Delivered</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-[#211f1e] p-4">
              <Grid3X3 size={20} className="text-[#95d1d1]/60" />
              <span className="mt-2 text-lg font-bold text-[#e7e1df]">5</span>
              <span className="text-[10px] text-[#d9c2b4]/50">Categories</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-[#211f1e] p-4">
              <Palette size={20} className="text-[#ffb4a5]/60" />
              <span className="mt-2 text-sm font-bold text-[#e7e1df]">Warm Tones</span>
              <span className="text-[10px] text-[#d9c2b4]/50">Gallery Theme</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-[#d9c2b4]/40">
            Ceremony (86) / Reception (124) / Portraits (98) / Details (22) / Behind the Scenes (18)
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
            Approval Checklist
          </span>
          <div className="mt-4 space-y-3">
            {([
              { key: 'reviewed' as const, label: 'I have reviewed all photos' },
              { key: 'satisfied' as const, label: 'I am satisfied with the delivered quality' },
              { key: 'understand' as const, label: 'I understand this marks the project as complete' },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className="flex w-full items-center gap-3 rounded-xl bg-[#211f1e] px-4 py-3.5 text-left transition-colors hover:bg-[#2c2928]"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                    checklist[item.key]
                      ? 'border-[#95d1d1] bg-[#95d1d1]/20'
                      : 'border-[#534439]/50 bg-transparent'
                  }`}
                >
                  {checklist[item.key] && <Check size={12} className="text-[#95d1d1]" />}
                </div>
                <span className="text-sm text-[#e7e1df]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-8 rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
          <span className="font-label text-[10px] uppercase tracking-widest text-[#d9c2b4]/60">
            Feedback (Optional)
          </span>

          {/* Star Rating */}
          <div className="mt-4 mb-4">
            <p className="mb-2 text-xs text-[#d9c2b4]/50">Rate your experience</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="rounded p-1 transition-colors hover:bg-[#2c2928]"
                >
                  <Star
                    size={24}
                    className={
                      s <= (hoveredStar || rating)
                        ? 'fill-[#ffb780] text-[#ffb780]'
                        : 'text-[#534439]/60'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any final notes for the photographer?"
            rows={4}
            className="w-full rounded-xl border border-[#534439]/30 bg-[#211f1e] px-4 py-3 text-sm text-[#e7e1df] placeholder-[#a18d80]/40 outline-none transition-colors focus:border-[#ffb780]/40"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleApprove}
            disabled={!allChecked}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
              allChecked
                ? 'bg-[#95d1d1] text-[#151312] hover:opacity-90'
                : 'cursor-not-allowed bg-[#534439]/30 text-[#a18d80]/40'
            }`}
          >
            <Check size={16} />
            Approve & Complete Project
          </button>
          <a
            href={`/gallery/${id}`}
            className="text-xs text-[#d9c2b4]/50 transition-colors hover:text-[#ffb780]"
          >
            Request Changes
          </a>
        </div>
      </div>
    </div>
  )
}
