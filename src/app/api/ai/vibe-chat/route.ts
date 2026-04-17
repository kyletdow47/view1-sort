import { NextRequest, NextResponse } from 'next/server'

import type {
  ChatMessage,
  VibeChatFinalizeResponse,
  VibeChatResponse,
} from '@/types/vibe-chat'
import { MAX_MESSAGE_LENGTH, MAX_TURNS } from '@/types/vibe-chat'

/**
 * POST /api/ai/vibe-chat
 *
 * Multi-turn photography style coach. Client sends the full message history
 * each turn; server delegates to the Supabase Edge Function (Claude Haiku
 * with tool-use) and returns either the next question or a finalized preset.
 *
 * If the Edge Function is unreachable, we degrade to a single-shot heuristic
 * finalize so the user never hits a dead end — the coach explains itself via
 * the `source: 'degraded'` marker.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { messages?: unknown; projectId?: string }
    const messages = body.messages

    if (!isValidMessageArray(messages)) {
      return NextResponse.json(
        { error: 'messages must be a non-empty array of {role, content}' },
        { status: 400 },
      )
    }

    const userTurns = messages.filter((m) => m.role === 'user').length
    if (userTurns > MAX_TURNS) {
      return NextResponse.json({ error: 'max turns exceeded' }, { status: 400 })
    }

    // Try Supabase Edge Function (backed by claude-haiku-4-5-20251001 + tool-use)
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase.functions.invoke('vibe-chat', {
        body: { messages, projectId: body.projectId },
      })
      if (!error && data) {
        return NextResponse.json(data as VibeChatResponse)
      }
      if (error) {
        console.warn('[vibe-chat] Edge function unavailable, degrading:', error.message)
      }
    } catch (invokeErr) {
      console.warn('[vibe-chat] Edge function call failed, degrading:', invokeErr)
    }

    // Graceful degradation: go straight to a best-effort finalize so
    // the user can still produce a preset without Claude. We don't try
    // to simulate multi-turn questioning offline.
    return NextResponse.json(degradedFinalize(messages))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/ai/vibe-chat]', message)
    return NextResponse.json({ error: 'Failed to process chat turn' }, { status: 500 })
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function isValidMessageArray(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) return false
  for (const item of value) {
    if (!item || typeof item !== 'object') return false
    const msg = item as Record<string, unknown>
    if (msg.role !== 'user' && msg.role !== 'assistant') return false
    if (typeof msg.content !== 'string') return false
    if (msg.content.length === 0 || msg.content.length > MAX_MESSAGE_LENGTH) return false
  }
  return true
}

/* ------------------------------------------------------------------ */
/*  Heuristic fallback                                                 */
/* ------------------------------------------------------------------ */

/**
 * Best-effort preset inference used when the Claude Edge Function is
 * unreachable. Scans all user messages for style keywords and makes a
 * single-shot decision — there is no multi-turn offline mode.
 */
function degradedFinalize(messages: ChatMessage[]): VibeChatFinalizeResponse {
  const combined = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')
    .toLowerCase()

  const isMoody = /\bmoody|dark|dramatic|shadow|contrast\b/.test(combined)
  const isBright = /\bbright|airy|light|soft|negative space\b/.test(combined)
  const isEditorial = /\beditorial|magazine|tight|crop|detail\b/.test(combined)
  const isWarm = /\bwarm|golden|sunset|amber\b/.test(combined)
  const isCool = /\bcool|blue|winter\b/.test(combined)

  const presetName = isMoody
    ? 'Moody & Dramatic'
    : isBright
      ? 'Bright & Airy'
      : isEditorial
        ? 'Editorial Tight'
        : 'Custom Style'

  return {
    kind: 'finalize',
    presetName,
    description: 'Auto-generated from your description while the style coach is offline.',
    summary:
      'The coach is offline right now, so here\'s a best-effort preset based on what you typed — feel free to edit the name or restart.',
    styleParams: {
      mood: isMoody ? 'dramatic' : isBright ? 'joyful' : isEditorial ? 'editorial' : 'natural',
      lighting: isMoody ? 'low-key' : isBright ? 'high-key' : 'natural',
      composition: isEditorial ? 'tight' : isBright ? 'wide' : 'balanced',
      colorTemp: isWarm ? 'warm' : isCool ? 'cool' : 'neutral',
      subjects: ['faces', 'details'],
      avoidPatterns: isMoody ? ['overexposed', 'flat lighting'] : ['blurry', 'poor exposure'],
    },
    source: 'degraded',
  }
}
