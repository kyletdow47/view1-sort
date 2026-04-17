'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Send,
  Save,
  Trash2,
  CheckCircle2,
  Loader2,
  Palette,
  Sun,
  Moon,
  Snowflake,
  Thermometer,
} from 'lucide-react'
import { useVibePresets } from '@/hooks/useVibePresets'
import { useVibeChat } from '@/hooks/useVibeChat'
import type { ParseVibeResponse, VibePreset } from '@/types/vibe-presets'

const GREETING =
  "Tell me about the photography style you want a preset for — mood, lighting, composition, anything that makes your look yours. I'll turn it into a reusable preset."

const EXAMPLE_PROMPTS = [
  'Dark moody wedding coverage, tight editorial crops, golden-hour portraits.',
  'Bright and airy with soft pastels and lots of negative space.',
  'High-contrast black and white street photography, candid faces.',
]

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function PresetsPage() {
  const { presets, savePreset, deletePreset, applyPreset, activePresetId } =
    useVibePresets()
  const { messages, draft, isThinking, error, send, reset } = useVibeChat({
    greeting: GREETING,
  })
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, isThinking])

  const handleSend = () => {
    if (!input.trim() || isThinking) return
    void send(input)
    setInput('')
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await savePreset({
        name: draft.presetName,
        description:
          messages.find((m) => m.role === 'user')?.text ?? draft.presetName,
        styleParams: draft.styleParams,
        source: 'ai_parsed',
      })
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Sparkles className="h-6 w-6 text-violet-300" />
            Vibe Presets
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Describe your style in plain words — I'll extract a reusable preset
            you can apply to any sort.
          </p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Saved presets */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-4 py-3 text-[12px] font-semibold uppercase tracking-widest text-white/50">
            Your presets
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {presets.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-white/40">
                No saved presets yet. Chat on the right to create one.
              </p>
            ) : (
              presets.map((p) => (
                <PresetCard
                  key={p.id}
                  preset={p}
                  active={p.id === activePresetId}
                  onApply={() => applyPreset(p.id)}
                  onDelete={() => deletePreset(p.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} text={m.text}>
                {m.draft && <DraftPresetCard draft={m.draft} />}
              </MessageBubble>
            ))}

            {isThinking && (
              <MessageBubble role="assistant" text="">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              </MessageBubble>
            )}

            {messages.length === 1 && !isThinking && (
              <div className="mt-4 flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt)
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-[12px] text-rose-300">{error}</p>
            )}
          </div>

          {/* Draft actions + composer */}
          {draft && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-violet-500/[0.06] px-5 py-3">
              <div className="text-[13px] text-white/70">
                Draft ready: <span className="font-semibold text-white">{draft.presetName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  disabled={saving}
                  className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
                >
                  Start over
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
                  }}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save as preset
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={draft ? 'Refine this preset…' : 'Describe your style…'}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
                disabled={isThinking}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-40"
                style={{
                  background:
                    'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
                }}
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ─── Preset card (left pane) ───────────────────────────────────────── */

function PresetCard({
  preset,
  active,
  onApply,
  onDelete,
}: {
  preset: VibePreset
  active: boolean
  onApply: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`group rounded-xl border p-3 transition-colors ${
        active
          ? 'border-violet-400/40 bg-violet-500/[0.08]'
          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {preset.name}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-white/50">
            {preset.description}
          </p>
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete preset"
          className="shrink-0 rounded-md p-1 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-rose-300 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <StyleParamPills
        mood={preset.styleParams.mood}
        lighting={preset.styleParams.lighting}
        colorTemp={preset.styleParams.colorTemp}
      />
      <button
        onClick={onApply}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          active
            ? 'bg-emerald-500/20 text-emerald-200'
            : 'bg-white/[0.06] text-white/70 hover:bg-white/10'
        }`}
      >
        {active ? (
          <>
            <CheckCircle2 className="h-3 w-3" />
            Active
          </>
        ) : (
          'Apply'
        )}
      </button>
    </div>
  )
}

/* ─── Message bubble ────────────────────────────────────────────────── */

function MessageBubble({
  role,
  text,
  children,
}: {
  role: 'assistant' | 'user'
  text: string
  children?: React.ReactNode
}) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-violet-500/20 text-white'
            : 'bg-white/[0.06] text-white/90'
        }`}
      >
        {text && <p className="whitespace-pre-wrap">{text}</p>}
        {children}
      </div>
    </div>
  )
}

/* ─── Draft preset card (inline in assistant message) ───────────────── */

function DraftPresetCard({ draft }: { draft: ParseVibeResponse }) {
  const p = draft.styleParams
  return (
    <div className="mt-3 rounded-xl border border-violet-400/30 bg-violet-500/[0.08] p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-violet-200">
        Draft preset
      </div>
      <p className="text-sm font-semibold text-white">{draft.presetName}</p>
      <StyleParamPills
        mood={p.mood}
        lighting={p.lighting}
        colorTemp={p.colorTemp}
      />
      {p.subjects.length > 0 && (
        <p className="mt-2 text-[11px] text-white/50">
          Favor: {p.subjects.join(', ')}
        </p>
      )}
      {p.avoidPatterns.length > 0 && (
        <p className="mt-1 text-[11px] text-white/50">
          Avoid: {p.avoidPatterns.join(', ')}
        </p>
      )}
    </div>
  )
}

/* ─── Pills ─────────────────────────────────────────────────────────── */

function StyleParamPills({
  mood,
  lighting,
  colorTemp,
}: {
  mood: string
  lighting: string
  colorTemp: 'warm' | 'neutral' | 'cool'
}) {
  const TempIcon =
    colorTemp === 'warm' ? Sun : colorTemp === 'cool' ? Snowflake : Thermometer
  const LightIcon = lighting === 'low-key' ? Moon : Sun
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <Pill icon={<Palette className="h-3 w-3" />} label={mood} />
      <Pill icon={<LightIcon className="h-3 w-3" />} label={lighting} />
      <Pill icon={<TempIcon className="h-3 w-3" />} label={colorTemp} />
    </div>
  )
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
      {icon}
      {label}
    </span>
  )
}
