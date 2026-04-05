'use client'

import { useState, useCallback } from 'react'
import {
  X,
  Sparkles,
  Hash,
  Calendar,
  Clock,
  Send,
  FileText,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
} from 'lucide-react'
import { PlatformPreview } from './PlatformPreview'
import type { Platform, CaptionTone, MockPhoto, CaptionOption, ScheduleConfig } from '@/types/content'

/* ------------------------------------------------------------------ */
/*  Mock data — TODO(content-api): replace with real project photos   */
/* ------------------------------------------------------------------ */

const MOCK_PHOTOS: MockPhoto[] = [
  { id: 'p1', name: 'Golden Hour Portraits', projectName: 'Smith & James Wedding', gradient: 'from-amber-400 to-orange-600', category: 'wedding' },
  { id: 'p2', name: 'First Dance', projectName: 'Smith & James Wedding', gradient: 'from-rose-400 to-pink-600', category: 'wedding' },
  { id: 'p3', name: 'Bridal Party', projectName: 'Smith & James Wedding', gradient: 'from-violet-400 to-purple-600', category: 'wedding' },
  { id: 'p4', name: 'Lobby Shot', projectName: 'Meridian Hotel Brand', gradient: 'from-slate-400 to-zinc-600', category: 'commercial' },
  { id: 'p5', name: 'Rooftop View', projectName: 'Meridian Hotel Brand', gradient: 'from-cyan-400 to-blue-600', category: 'commercial' },
  { id: 'p6', name: 'Engagement Walk', projectName: 'Torres Engagement', gradient: 'from-emerald-400 to-teal-600', category: 'portrait' },
  { id: 'p7', name: 'Family Formals', projectName: 'Smith Family Portraits', gradient: 'from-indigo-400 to-blue-600', category: 'portrait' },
  { id: 'p8', name: 'Detail Flatlays', projectName: 'Marcus Cole Commercial', gradient: 'from-yellow-400 to-amber-600', category: 'commercial' },
]

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bg: string }> = {
  instagram: { label: 'Instagram', color: 'text-pink-400', bg: 'bg-pink-400/15' },
  facebook: { label: 'Facebook', color: 'text-blue-400', bg: 'bg-blue-400/15' },
  tiktok: { label: 'TikTok', color: 'text-white', bg: 'bg-white/15' },
  pinterest: { label: 'Pinterest', color: 'text-red-400', bg: 'bg-red-400/15' },
}

const CAPTION_MOCK: Record<CaptionTone, string[]> = {
  professional: [
    'Capturing the essence of timeless elegance. Every detail tells a story, and every moment deserves to be preserved with intention and artistry.',
    'Behind every great photograph is a vision brought to life. This session exemplifies the beauty of light, composition, and genuine connection.',
    'Award-winning imagery crafted for those who appreciate the art of photography. Inquiries open for 2026 dates.',
  ],
  casual: [
    'Honestly, days like this are why I do what I do 📸✨ The light was *chef's kiss* and the vibes were immaculate.',
    "Look at them go!! Still smiling thinking about this session — easily one of my favorites from the past month 🫶",
    "Can't stop, won't stop obsessing over this golden hour magic. Who else is a sucker for that warm glow? 🌅",
  ],
  storytelling: [
    'It was late afternoon when the light finally broke through the clouds — that soft, golden kind that photographers wait all day for. This was that moment.',
    'She whispered something to him and he laughed — the real kind, the unguarded kind. I pressed the shutter and knew immediately: this is the one.',
    'There are shoots you forget and then there are shoots that stay with you. This one will stay with me for a long time.',
  ],
}

const HASHTAG_SUGGESTIONS = [
  'photographylife', 'weddingphotography', 'portraitphotography', 'goldenhour',
  'photographylovers', 'lookslikefilm', 'vsco', 'nikon', 'canon', 'lightroom',
  'portraitmode', 'weddingday', 'bride', 'couple', 'love', 'photography',
  'photographer', 'naturallightphotography', 'momentsofmine', 'artofvisuals',
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/*  PostCreator main component                                         */
/* ------------------------------------------------------------------ */

interface PostCreatorProps {
  onClose: () => void
}

export function PostCreator({ onClose }: PostCreatorProps) {
  // Photo selection
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])

  // Caption
  const [caption, setCaption] = useState('')
  const [showToneSelector, setShowToneSelector] = useState(false)
  const [selectedTone, setSelectedTone] = useState<CaptionTone>('professional')
  const [captionOptions, setCaptionOptions] = useState<CaptionOption[]>([])
  const [generatingCaption, setGeneratingCaption] = useState(false)

  // Hashtags
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])
  const [suggestingHashtags, setSuggestingHashtags] = useState(false)
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false)

  // Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram'])
  const [previewPlatform, setPreviewPlatform] = useState<Platform>('instagram')

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    postNow: false,
    date: new Date().toISOString().split('T')[0] ?? '',
    time: '09:00',
  })

  // Saving
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<'draft' | 'scheduled' | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  /* -- Photo selection -------------------------------------------- */
  const togglePhoto = useCallback((id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }, [])

  const selectedPhotos = MOCK_PHOTOS.filter((p) => selectedPhotoIds.includes(p.id))

  /* -- Caption generation ----------------------------------------- */
  const handleGenerateCaptions = async () => {
    setGeneratingCaption(true)
    setShowToneSelector(false)
    // TODO(content-api): call POST /api/content/generate-caption { photoIds, tone }
    await new Promise<void>((resolve) => { setTimeout(resolve, 1600) })
    const options = CAPTION_MOCK[selectedTone].map((text, i) => ({
      id: `opt-${i}`,
      text,
      tone: selectedTone,
    }))
    setCaptionOptions(options)
    setGeneratingCaption(false)
  }

  const selectCaption = (text: string) => {
    setCaption(text)
    setCaptionOptions([])
  }

  /* -- Hashtag suggestions ---------------------------------------- */
  const handleSuggestHashtags = async () => {
    setSuggestingHashtags(true)
    // TODO(content-api): call POST /api/content/suggest-hashtags { caption, photoCategories }
    await new Promise<void>((resolve) => { setTimeout(resolve, 1200) })
    const shuffled = [...HASHTAG_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 12)
    setSuggestedHashtags(shuffled)
    setShowHashtagSuggestions(true)
    setSuggestingHashtags(false)
  }

  const toggleHashtag = (tag: string) => {
    setHashtags((prev) => prev.includes(tag) ? prev.filter((h) => h !== tag) : [...prev, tag])
  }

  const addManualHashtag = () => {
    const clean = hashtagInput.replace(/^#/, '').trim()
    if (clean && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean])
    }
    setHashtagInput('')
  }

  /* -- Platform selection ----------------------------------------- */
  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        const next = prev.filter((x) => x !== p)
        if (previewPlatform === p && next.length > 0) setPreviewPlatform(next[0]!)
        return next
      }
      return [...prev, p]
    })
  }

  /* -- Save actions ----------------------------------------------- */
  const handleSave = async (mode: 'draft' | 'scheduled') => {
    setSaving(true)
    // TODO(content-api): POST /api/content/posts { caption, hashtags, platforms, photoIds, scheduledAt, status }
    await new Promise<void>((resolve) => { setTimeout(resolve, 900) })
    setSaving(false)
    setSaved(mode)
    setTimeout(() => setSaved(null), 2400)
  }

  const handlePostNow = async () => {
    const fullCaption = caption + (hashtags.length > 0 ? '\n\n' + hashtags.map(h => `#${h}`).join(' ') : '')
    await navigator.clipboard.writeText(fullCaption)
    setCopiedToClipboard(true)
    setTimeout(() => setCopiedToClipboard(false), 3000)
    // TODO(content-api v3): actual platform API posting
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="flex w-full max-w-[1100px] overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(160deg, rgba(20,16,40,0.98) 0%, rgba(10,8,30,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Left: Form ─────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6" style={{ maxWidth: '560px' }}>
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-white">Create Post</h2>
              <p className="text-[12px] text-white/40">AI-powered captions & scheduling</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Photo Selector */}
          <GlassPanel className="mb-4 p-4">
            <SectionHeader>Select Photos ({selectedPhotoIds.length} selected)</SectionHeader>
            <div className="grid grid-cols-4 gap-2">
              {MOCK_PHOTOS.map((photo) => {
                const selected = selectedPhotoIds.includes(photo.id)
                return (
                  <button
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className="group relative aspect-square overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
                  >
                    <div className={`h-full w-full bg-gradient-to-br ${photo.gradient}`} />
                    {selected && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(99,102,241,0.55)', border: '2px solid #6366F1' }}>
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-xl p-1.5 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                      <p className="truncate text-[8px] text-white">{photo.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedPhotoIds.length > 0 && (
              <p className="mt-2 text-[10px] text-white/35">
                From: {[...new Set(selectedPhotos.map(p => p.projectName))].join(', ')}
              </p>
            )}
          </GlassPanel>

          {/* Caption */}
          <GlassPanel className="mb-4 p-4">
            <SectionHeader>Caption</SectionHeader>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption, or use AI to generate one…"
              rows={4}
              className="w-full resize-none rounded-xl bg-white/5 px-4 py-3 text-[13px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-indigo-500/60 transition-all"
            />

            {/* AI Generate button + tone selector */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowToneSelector(!showToneSelector)}
                disabled={generatingCaption}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)' }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {generatingCaption ? 'Generating…' : 'AI Generate'}
                {!generatingCaption && (showToneSelector ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                {generatingCaption && <RefreshCw className="h-3 w-3 animate-spin" />}
              </button>
              {caption && (
                <p className="text-[10px] text-white/30">{caption.length} chars</p>
              )}
            </div>

            {/* Tone selector */}
            {showToneSelector && (
              <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-indigo-300/70">Choose tone</p>
                <div className="flex gap-2">
                  {(['professional', 'casual', 'storytelling'] as CaptionTone[]).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-medium capitalize transition-colors ${selectedTone === tone ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerateCaptions}
                  className="mt-3 w-full rounded-xl py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
                >
                  Generate 3 Options
                </button>
              </div>
            )}

            {/* Caption options */}
            {captionOptions.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-[10px] text-white/40">Pick a caption:</p>
                {captionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectCaption(opt.text)}
                    className="rounded-xl p-3 text-left text-[12px] leading-relaxed text-white/80 transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Hashtags */}
          <GlassPanel className="mb-4 p-4">
            <SectionHeader>Hashtags ({hashtags.length})</SectionHeader>

            {/* Selected hashtags */}
            {hashtags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleHashtag(tag)}
                    className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  >
                    #{tag} <X className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Manual hashtag input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addManualHashtag() } }}
                  placeholder="Add hashtag…"
                  className="w-full rounded-xl bg-white/5 py-2 pl-9 pr-3 text-[12px] text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-indigo-500/60"
                />
              </div>
              <button
                onClick={handleSuggestHashtags}
                disabled={suggestingHashtags}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-amber-300 transition-colors hover:bg-amber-400/10 disabled:opacity-50"
                style={{ border: '1px solid rgba(251,191,36,0.25)' }}
              >
                {suggestingHashtags ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {suggestingHashtags ? 'Suggesting…' : 'AI Suggest'}
              </button>
            </div>

            {/* Suggested hashtags */}
            {showHashtagSuggestions && suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[10px] text-white/35">Tap to add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedHashtags.map((tag) => {
                    const active = hashtags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleHashtag(tag)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}
                        style={{ border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}` }}
                      >
                        {active && <Check className="h-2.5 w-2.5" />}
                        #{tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Platform selector */}
          <GlassPanel className="mb-4 p-4">
            <SectionHeader>Platforms</SectionHeader>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([platform, cfg]) => {
                const active = selectedPlatforms.includes(platform)
                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-all ${active ? `${cfg.bg} ${cfg.color}` : 'bg-white/5 text-white/40 hover:bg-white/8'}`}
                    style={{ border: `1px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}` }}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-current' : 'bg-white/20'}`} />
                    {cfg.label}
                    {active && <Check className="ml-auto h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          </GlassPanel>

          {/* Schedule */}
          <GlassPanel className="mb-6 p-4">
            <SectionHeader>When to Post</SectionHeader>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] text-white/60">Post Now</span>
              <button
                onClick={() => setSchedule((s) => ({ ...s, postNow: !s.postNow }))}
                className={`relative h-5 w-9 rounded-full transition-colors ${schedule.postNow ? 'bg-indigo-500' : 'bg-white/15'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${schedule.postNow ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {!schedule.postNow && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] text-white/35">Date</label>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-white/30" />
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => setSchedule((s) => ({ ...s, date: e.target.value }))}
                      className="w-full bg-transparent text-[12px] text-white outline-none"
                    />
                  </div>
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-[10px] text-white/35">Time</label>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-white/30" />
                    <input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                      className="w-full bg-transparent text-[12px] text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            {schedule.postNow && (
              <p className="text-[11px] text-white/40">Caption + hashtags will be copied to clipboard. Open your platform app to paste and post.</p>
            )}
          </GlassPanel>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {schedule.postNow ? (
              <button
                onClick={handlePostNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
              >
                {copiedToClipboard ? (
                  <><CheckCircle2 className="h-4 w-4" /> Copied to Clipboard!</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy Caption &amp; Post</>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/15 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  {saved === 'draft' ? 'Saved!' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave('scheduled')}
                  disabled={saving || selectedPlatforms.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : saved === 'scheduled' ? (
                    <><CheckCircle2 className="h-4 w-4" /> Scheduled!</>
                  ) : (
                    <><Send className="h-4 w-4" /> Schedule Post</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Platform Preview ─────────────────────────────────── */}
        <div
          className="flex w-[420px] shrink-0 flex-col p-6"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/40">Preview</p>

          {/* Platform tabs */}
          {selectedPlatforms.length > 0 ? (
            <>
              <div
                className="mb-5 flex items-center gap-1 rounded-xl p-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {selectedPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreviewPlatform(p)}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize transition-colors ${previewPlatform === p ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {PLATFORM_CONFIG[p].label}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 items-start justify-center overflow-y-auto pt-2">
                <PlatformPreview
                  platform={previewPlatform}
                  photos={selectedPhotos}
                  caption={caption}
                  hashtags={hashtags}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                <Send className="h-5 w-5 text-white/20" />
              </div>
              <p className="text-[13px] text-white/30">Select at least one platform to see a preview</p>
            </div>
          )}

          {/* Platform-specific tips */}
          {selectedPlatforms.length > 0 && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                {PLATFORM_CONFIG[previewPlatform].label} Tips
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                {previewPlatform === 'instagram' && 'Best time to post: Tue-Fri 8–11am. Use 5–10 targeted hashtags for max reach. Square or portrait crops perform best.'}
                {previewPlatform === 'facebook' && 'Landscape format works best. Post with minimal hashtags (1-3). Video gets 2× organic reach of images.'}
                {previewPlatform === 'tiktok' && 'Portrait video or photo carousels perform best. Post at 7–9pm for peak engagement. Max 100 chars in caption.'}
                {previewPlatform === 'pinterest' && 'Tall portrait images (2:3) get more saves. Add descriptive alt text. Best boards: Wedding, Portrait, Photography.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
