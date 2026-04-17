'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Check,
  Loader2,
  Palette,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'

import type { ChatMessage, VibeChatResponse } from '@/types/vibe-chat'
import { AVG_TURNS, MAX_MESSAGE_LENGTH, MAX_TURNS } from '@/types/vibe-chat'
import type { VibeStyleParams } from '@/types/vibe-presets'

/* ─────────────────────────────────────────────
   Public shape
   ───────────────────────────────────────────── */

export interface VibeChatBuiltInOption {
  id: string
  name: string
  icon?: string
}

export type VibeChatFinalizeEvent =
  | {
      type: 'custom'
      preset: {
        name: string
        description: string
        styleParams: VibeStyleParams
      }
      summary: string
    }
  | { type: 'builtIn'; presetId: string }

export interface VibeChatProps {
  open: boolean
  projectId?: string
  builtInPresets?: VibeChatBuiltInOption[]
  onClose: () => void
  onFinalize: (event: VibeChatFinalizeEvent) => void
}

/* ─────────────────────────────────────────────
   Static content
   ───────────────────────────────────────────── */

const OPENERS = [
  'Tell me about this shoot — what\'s the vibe you\'re going for?',
  'Describe the look and feel. Moody? Bright? Somewhere in between?',
  'What\'s the edit you\'re after? A few words is enough to get started.',
] as const

const QUICK_STARTERS: { label: string; value: string }[] = [
  {
    label: 'Moody editorial',
    value:
      'Moody and dramatic editorial — deep shadows, rich contrast, tight crops on faces and hands.',
  },
  {
    label: 'Bright & airy',
    value:
      'Bright and airy wedding — lots of negative space, soft natural light, warm highlights.',
  },
  {
    label: 'Golden hour portraits',
    value:
      'Warm golden hour portraits — amber tones, soft light, intimate and romantic.',
  },
  {
    label: 'Documentary candids',
    value:
      'Documentary / candid — real moments, balanced exposure, natural light, emphasis on emotion over posing.',
  },
]

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */

interface FinalizeState {
  presetName: string
  description: string
  summary: string
  styleParams: VibeStyleParams
  source: 'claude' | 'heuristic' | 'degraded'
}

export function VibeChat({
  open,
  projectId,
  builtInPresets = [],
  onClose,
  onFinalize,
}: VibeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [finalize, setFinalize] = useState<FinalizeState | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Pick a random opener per-session so repeat users don't see the same line.
  const [openerIdx] = useState(() => Math.floor(Math.random() * OPENERS.length))

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Reset state whenever the overlay opens
  useEffect(() => {
    if (!open) return
    setMessages([])
    setInput('')
    setFinalize(null)
    setEditName('')
    setError(null)
    // Focus after the overlay paints
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [open])

  // Cancel any in-flight request when closing
  useEffect(() => {
    if (open) return
    abortRef.current?.abort()
    abortRef.current = null
  }, [open])

  // Auto-scroll to bottom on new content
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking, finalize])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !thinking) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, thinking, onClose])

  const userTurns = messages.filter((m) => m.role === 'user').length

  const sendTurn = useCallback(
    async (nextMessages: ChatMessage[]) => {
      setThinking(true)
      setError(null)

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const timeout = setTimeout(() => controller.abort(), 30_000)

      try {
        const res = await fetch('/api/ai/vibe-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages, projectId }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = (await res.json()) as VibeChatResponse

        if (data.kind === 'question') {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.question },
          ])
        } else {
          setFinalize({
            presetName: data.presetName,
            description: data.description,
            summary: data.summary,
            styleParams: data.styleParams,
            source: data.source,
          })
          setEditName(data.presetName)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.summary },
          ])
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Silent on manual abort (overlay closed) — otherwise treat as timeout
          if (!controller.signal.aborted || abortRef.current === controller) {
            setError('Request timed out. Please try again.')
          }
        } else {
          setError('Could not reach the coach. Please try again.')
        }
      } finally {
        clearTimeout(timeout)
        setThinking(false)
      }
    },
    [projectId],
  )

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (!text || thinking || finalize) return
    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`)
      return
    }
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    void sendTurn(next)
  }, [input, thinking, finalize, messages, sendTurn])

  const handleRetry = useCallback(() => {
    if (messages.length === 0) return
    setError(null)
    void sendTurn(messages)
  }, [messages, sendTurn])

  const handleRestart = useCallback(() => {
    setMessages([])
    setFinalize(null)
    setEditName('')
    setInput('')
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleSaveCustom = useCallback(() => {
    if (!finalize) return
    const name = editName.trim() || finalize.presetName
    onFinalize({
      type: 'custom',
      preset: {
        name,
        description: finalize.description,
        styleParams: finalize.styleParams,
      },
      summary: finalize.summary,
    })
  }, [finalize, editName, onFinalize])

  const handleSkipToPreset = useCallback(
    (id: string) => onFinalize({ type: 'builtIn', presetId: id }),
    [onFinalize],
  )

  if (!open) return null

  const isEmpty = messages.length === 0
  const shownTurn = Math.min(userTurns + (thinking ? 1 : 0), MAX_TURNS)

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="AI style coach"
    >
      <div className="relative flex h-full w-full flex-col bg-[#0a0b14]">
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5749F4]/20">
              <Wand2 className="h-4 w-4 text-[#818CF8]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Style Coach</h2>
              <p className="text-[11px] text-white/40">
                {finalize
                  ? finalize.source === 'degraded'
                    ? 'Offline — review and save'
                    : 'Ready — review and save'
                  : `A few quick questions to teach the AI your eye · turn ${shownTurn} of ~${AVG_TURNS}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {builtInPresets.length > 0 && !finalize && (
              <SkipToPresetButton
                presets={builtInPresets}
                onSelect={handleSkipToPreset}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white/90"
              aria-label="Close coach"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <AssistantMessage text={OPENERS[openerIdx]} />

            {isEmpty && !thinking && !error && (
              <div className="mt-1 flex flex-wrap gap-2">
                {QUICK_STARTERS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setInput(s.value)
                      setTimeout(() => inputRef.current?.focus(), 30)
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <UserMessage key={i} text={m.content} />
              ) : (
                <AssistantMessage key={i} text={m.content} />
              ),
            )}

            {thinking && <ThinkingIndicator />}

            {error && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[12px] text-amber-300/90">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{error}</span>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-amber-200 underline underline-offset-2 hover:text-amber-100"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {finalize && (
              <FinalizeCard
                finalize={finalize}
                editName={editName}
                onNameChange={setEditName}
                onSave={handleSaveCustom}
                onRestart={handleRestart}
              />
            )}
          </div>
        </div>

        {/* ── Input (hidden once finalized) ────────────────────── */}
        {!finalize && (
          <div className="border-t border-white/10 px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                disabled={thinking}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Type your answer… (Shift+Enter for a new line)"
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-[#5749F4]/50 focus:ring-1 focus:ring-[#5749F4]/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || thinking}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5749F4] text-white transition-colors hover:bg-[#4f46e5] disabled:bg-white/10 disabled:text-white/30"
                aria-label="Send"
              >
                {thinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-[#5749F4] px-4 py-2.5 text-[14px] text-white">
        {text}
      </div>
    </div>
  )
}

function AssistantMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5749F4]/15">
        <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" />
      </div>
      <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[14px] text-white/90">
        {text}
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3" aria-label="Coach is thinking">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5749F4]/15">
        <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3">
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}

function SkipToPresetButton({
  presets,
  onSelect,
}: {
  presets: VibeChatBuiltInOption[]
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <Palette className="h-3.5 w-3.5" />
        Use a built-in preset
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#15162a] shadow-xl">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {p.icon && <span>{p.icon}</span>}
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FinalizeCard({
  finalize,
  editName,
  onNameChange,
  onSave,
  onRestart,
}: {
  finalize: FinalizeState
  editName: string
  onNameChange: (v: string) => void
  onSave: () => void
  onRestart: () => void
}) {
  const { styleParams } = finalize
  const paramRows = [
    { label: 'Mood', value: styleParams.mood },
    { label: 'Lighting', value: styleParams.lighting },
    { label: 'Composition', value: styleParams.composition },
    { label: 'Color temp', value: styleParams.colorTemp },
  ] as const

  return (
    <div className="mt-4 rounded-2xl border border-[#5749F4]/30 bg-gradient-to-b from-[#5749F4]/10 to-white/[0.02] p-5">
      <div className="flex items-center gap-2 text-[#818CF8]">
        <Check className="h-4 w-4" />
        <span className="text-[13px] font-semibold">Preset ready</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {paramRows.map((r) => (
          <div key={r.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-white/40">{r.label}</div>
            <div className="mt-0.5 text-[13px] font-medium capitalize text-white/90">
              {r.value}
            </div>
          </div>
        ))}
      </div>

      {styleParams.subjects.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Prioritize</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {styleParams.subjects.map((s) => (
              <span
                key={s}
                className="rounded-full border border-[#5749F4]/30 bg-[#5749F4]/15 px-2 py-0.5 text-[11px] text-[#818CF8]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {styleParams.avoidPatterns.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Avoid</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {styleParams.avoidPatterns.map((p) => (
              <span
                key={p}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-[12px] font-medium text-white/60" htmlFor="vibe-chat-preset-name">
          Preset name
        </label>
        <input
          id="vibe-chat-preset-name"
          type="text"
          value={editName}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={80}
          className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-[#5749F4]/50 focus:ring-1 focus:ring-[#5749F4]/20"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!editName.trim()}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#5749F4] text-[13px] font-semibold text-white transition-colors hover:bg-[#4f46e5] disabled:bg-white/10 disabled:text-white/30"
        >
          <Check className="h-3.5 w-3.5" />
          Save &amp; use preset
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Restart
        </button>
      </div>

      {finalize.source === 'degraded' && (
        <p className="mt-3 text-[11px] text-white/40">
          Offline fallback — the live coach wasn't reachable. This is a best-effort preset; you can edit it or restart when the coach is back.
        </p>
      )}
    </div>
  )
}
