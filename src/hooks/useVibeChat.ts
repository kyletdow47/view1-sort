'use client'

import { useCallback, useState } from 'react'
import type {
  ParseVibeResponse,
  VibeStyleParams,
} from '@/types/vibe-presets'

export type VibeChatRole = 'assistant' | 'user'

export interface VibeChatMessage {
  id: string
  role: VibeChatRole
  text: string
  /** When the assistant has produced a draft preset, attach it here for UI. */
  draft?: ParseVibeResponse | null
}

export interface UseVibeChatOptions {
  /** Optional first-message shown by the assistant. */
  greeting?: string
  /** Scope the /api/ai/parse-vibe call to a specific project. */
  projectId?: string
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Shared chat state for the Vibe Preset creator and the in-sort context chat.
 * Accumulates photographer replies, calls `/api/ai/parse-vibe`, and keeps
 * the latest draft preset alongside the message stream.
 */
export function useVibeChat(options: UseVibeChatOptions = {}) {
  const { greeting, projectId } = options

  const [messages, setMessages] = useState<VibeChatMessage[]>(() =>
    greeting
      ? [{ id: uid(), role: 'assistant', text: greeting, draft: null }]
      : [],
  )
  const [draft, setDraft] = useState<ParseVibeResponse | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMsg: VibeChatMessage = {
        id: uid(),
        role: 'user',
        text: trimmed,
      }
      setMessages((prev) => [...prev, userMsg])
      setIsThinking(true)
      setError(null)

      try {
        const res = await fetch('/api/ai/parse-vibe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: trimmed, projectId }),
        })
        if (!res.ok) throw new Error(`parse-vibe returned ${res.status}`)
        const parsed = (await res.json()) as ParseVibeResponse

        setDraft(parsed)
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: assistantReply(parsed),
            draft: parsed,
          },
        ])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not parse vibe'
        setError(message)
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: `I had trouble parsing that — try rephrasing in a sentence or two. (${message})`,
          },
        ])
      } finally {
        setIsThinking(false)
      }
    },
    [projectId],
  )

  const reset = useCallback(() => {
    setMessages(
      greeting
        ? [{ id: uid(), role: 'assistant', text: greeting, draft: null }]
        : [],
    )
    setDraft(null)
    setIsThinking(false)
    setError(null)
  }, [greeting])

  const styleParams: VibeStyleParams | null = draft?.styleParams ?? null

  return {
    messages,
    draft,
    styleParams,
    isThinking,
    error,
    send,
    reset,
  }
}

function assistantReply(parsed: ParseVibeResponse): string {
  const { presetName, styleParams, confidence } = parsed
  const mood = styleParams.mood
  const lighting = styleParams.lighting
  const temp = styleParams.colorTemp
  const pct = confidence ? Math.round(confidence * 100) : null
  return (
    `Got it — I'd call this "${presetName}". ` +
    `Mood: ${mood}, lighting: ${lighting}, color temp: ${temp}.` +
    (pct !== null ? ` (Confidence: ${pct}%)` : '') +
    ` Save it, or tell me what to tweak.`
  )
}
