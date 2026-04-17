// Supabase Edge Function: vibe-chat
// Model: claude-haiku-4-5-20251001 with tool use.
// Multi-turn photography style coach that emits either a follow-up
// question or a final VibePreset via Claude tool calls.
//
// Invoke via: supabase.functions.invoke('vibe-chat', { body: { messages, projectId } })

import Anthropic from 'npm:@anthropic-ai/sdk'
import { checkRateLimit, getUserKey } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_TURNS = 5
const MAX_MESSAGE_LENGTH = 1000
const RATE_LIMIT_FUNCTION = 'vibe-chat'
const RATE_LIMIT_MAX = 40 // slightly higher than one-shot routes — chats need multiple requests
const RATE_LIMIT_WINDOW_SECONDS = 60

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface VibeStyleParams {
  mood: string
  lighting: string
  composition: string
  colorTemp: 'warm' | 'neutral' | 'cool'
  subjects: string[]
  avoidPatterns: string[]
}

interface ErrorResponse {
  error: string
  code: string
}

/* ------------------------------------------------------------------ */
/*  Prompt + tool definitions                                          */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are a photography style coach helping a professional photographer teach an AI sorter their eye.

Your goal: in 2-4 targeted questions (hard cap 5), gather enough information to generate a custom vibe preset that accurately reflects their editing style and priorities for the current shoot.

What you need to learn (in rough order of importance):
1. MOOD & LOOK — moody vs bright, dramatic vs natural, editorial vs documentary
2. LIGHTING preference — low-key, high-key, golden hour, natural, studio
3. COLOR palette — warm, cool, neutral
4. SUBJECTS to emphasize — faces, emotion, details, candids, environment
5. PATTERNS to avoid — overexposed, blurry, flat lighting, harsh shadows, etc.

HOW TO ASK:
- One question at a time. Keep it short and concrete.
- Build on prior answers — never repeat what you already have.
- Mirror the photographer's own words where possible.
- If an answer is vague, ask a sharper follow-up rather than moving on.
- If an answer is off-topic or nonsensical, redirect politely with a focused question.

WHEN TO FINALIZE:
- After 2-3 answers you usually have enough. Don't stretch the conversation.
- By turn 5 you MUST call finalize_preset with your best inference.
- Once you finalize, include a short, friendly 1-2 sentence "summary" in the photographer's own words when possible — this is shown back to them as confirmation.

Valid enum values for styleParams:
- mood: dramatic | joyful | editorial | natural | romantic | moody
- lighting: low-key | high-key | natural | golden-hour | studio
- composition: tight | wide | balanced | documentary
- colorTemp: warm | cool | neutral

Always call exactly one tool per turn: ask_question OR finalize_preset.`

const ASK_QUESTION_TOOL = {
  name: 'ask_question',
  description: 'Ask ONE short clarifying question to learn about the photographer\'s style for this shoot.',
  input_schema: {
    type: 'object' as const,
    properties: {
      question: {
        type: 'string' as const,
        description: 'The question — specific, concise, one at a time.',
      },
    },
    required: ['question'],
  },
}

const FINALIZE_PRESET_TOOL = {
  name: 'finalize_preset',
  description: 'Emit the final vibe preset based on everything gathered in the conversation.',
  input_schema: {
    type: 'object' as const,
    properties: {
      presetName: {
        type: 'string' as const,
        description: 'Short evocative 2-4 word name (e.g. "Moody Editorial", "Golden Hour Candid").',
      },
      description: {
        type: 'string' as const,
        description: 'One sentence describing the style in plain English.',
      },
      summary: {
        type: 'string' as const,
        description: '1-2 sentence friendly recap of what you heard, shown back to the photographer. Use their own words when possible.',
      },
      styleParams: {
        type: 'object' as const,
        properties: {
          mood: {
            type: 'string' as const,
            enum: ['dramatic', 'joyful', 'editorial', 'natural', 'romantic', 'moody'],
          },
          lighting: {
            type: 'string' as const,
            enum: ['low-key', 'high-key', 'natural', 'golden-hour', 'studio'],
          },
          composition: {
            type: 'string' as const,
            enum: ['tight', 'wide', 'balanced', 'documentary'],
          },
          colorTemp: {
            type: 'string' as const,
            enum: ['warm', 'cool', 'neutral'],
          },
          subjects: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: '3-5 focus subjects (e.g. "faces", "emotion", "hands", "landscape").',
          },
          avoidPatterns: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: '3-5 patterns to avoid (e.g. "overexposed", "flat lighting", "blurry").',
          },
        },
        required: ['mood', 'lighting', 'composition', 'colorTemp', 'subjects', 'avoidPatterns'],
      },
    },
    required: ['presetName', 'description', 'summary', 'styleParams'],
  },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function errorResponse(error: string, code: string, status: number): Response {
  const body: ErrorResponse = { error, code }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false
  for (const m of messages) {
    if (!m || typeof m !== 'object') return false
    const msg = m as Record<string, unknown>
    if (msg.role !== 'user' && msg.role !== 'assistant') return false
    if (typeof msg.content !== 'string') return false
    if (msg.content.length === 0 || msg.content.length > MAX_MESSAGE_LENGTH) return false
  }
  return true
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as { messages?: unknown; projectId?: string }

    if (!validateMessages(body.messages)) {
      return errorResponse(
        'messages must be a non-empty array of {role, content} with content 1-1000 chars',
        'INVALID_INPUT',
        400,
      )
    }

    const messages = body.messages
    const userTurns = messages.filter(m => m.role === 'user').length
    if (userTurns > MAX_TURNS) {
      return errorResponse('max turns exceeded', 'MAX_TURNS_EXCEEDED', 400)
    }

    // Rate limit
    const userId = getUserKey(req)
    const allowed = await checkRateLimit(
      userId,
      RATE_LIMIT_FUNCTION,
      RATE_LIMIT_WINDOW_SECONDS,
      RATE_LIMIT_MAX,
    )
    if (!allowed) {
      return errorResponse(
        `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} requests per minute.`,
        'RATE_LIMIT_EXCEEDED',
        429,
      )
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return errorResponse('ANTHROPIC_API_KEY not configured', 'API_KEY_MISSING', 500)
    }

    const client = new Anthropic({ apiKey })

    // When we've hit the cap, force the model to finalize by exposing
    // only the finalize tool and hard-locking tool_choice to it.
    const forceFinalize = userTurns >= MAX_TURNS
    const tools = forceFinalize ? [FINALIZE_PRESET_TOOL] : [ASK_QUESTION_TOOL, FINALIZE_PRESET_TOOL]
    const toolChoice = forceFinalize
      ? { type: 'tool' as const, name: 'finalize_preset' }
      : { type: 'any' as const }

    const systemSuffix = forceFinalize
      ? '\n\nYou have reached the maximum question limit. You MUST call finalize_preset now using your best inference from the conversation so far.'
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + systemSuffix,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      tools,
      tool_choice: toolChoice,
    })

    const toolUse = response.content.find(b => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return errorResponse('model did not call a tool', 'MODEL_NO_TOOL', 502)
    }

    if (toolUse.name === 'ask_question') {
      const input = toolUse.input as { question: string }
      return new Response(
        JSON.stringify({
          kind: 'question',
          question: input.question,
          turn: userTurns + 1,
          source: 'claude',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (toolUse.name === 'finalize_preset') {
      const input = toolUse.input as {
        presetName: string
        description: string
        summary: string
        styleParams: VibeStyleParams
      }
      return new Response(
        JSON.stringify({
          kind: 'finalize',
          presetName: input.presetName,
          description: input.description,
          summary: input.summary,
          styleParams: input.styleParams,
          source: 'claude',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return errorResponse(`unknown tool: ${toolUse.name}`, 'MODEL_UNKNOWN_TOOL', 502)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[vibe-chat]', message)
    return errorResponse(message, 'INTERNAL_ERROR', 500)
  }
})
