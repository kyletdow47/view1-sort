import { NextRequest, NextResponse } from 'next/server'

import type { ParseVibeRequest, ParseVibeResponse, VibeStyleParams } from '@/types/vibe-presets'

/**
 * POST /api/ai/parse-vibe
 *
 * Accepts a natural-language style description from the photographer and
 * returns structured style parameters.
 *
 * TODO: Replace the mock implementation below with a real Supabase Edge Function.
 *
 * Edge Function path:   supabase/functions/parse-vibe/index.ts
 * Claude model:         claude-haiku-4-5-20251001  (fast + cheap for structured extraction)
 * Prompt pattern:
 *   System: "You are a photography style AI. Extract style parameters from the
 *            description and return valid JSON matching the VibeStyleParams schema."
 *   User:   <photographer's description>
 *
 * Invocation from this route:
 *   const { data } = await supabase.functions.invoke('parse-vibe', {
 *     body: { description, projectId },
 *   })
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ParseVibeRequest
    const { description, projectId } = body

    if (!description?.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    // Try Supabase Edge Function (backed by claude-haiku-4-5-20251001)
    let response: ParseVibeResponse | null = null
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase.functions.invoke('parse-vibe', {
        body: { description, projectId },
      })
      if (!error && data) {
        response = data as ParseVibeResponse
      } else if (error) {
        console.warn('[parse-vibe] Edge function unavailable, using heuristic:', error.message)
      }
    } catch (invokeErr) {
      console.warn('[parse-vibe] Edge function call failed, using heuristic:', invokeErr)
    }

    // Heuristic fallback — simulates Claude API structured extraction
    const mockResponse: ParseVibeResponse = response ?? extractStyleParams(description)

    return NextResponse.json(mockResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/ai/parse-vibe]', message)
    return NextResponse.json({ error: 'Failed to parse vibe description' }, { status: 500 })
  }
}

/**
 * Heuristic style-parameter extractor.
 * In production this logic lives inside the Claude prompt — not here.
 */
function extractStyleParams(description: string): ParseVibeResponse {
  const lower = description.toLowerCase()

  const isMoody =
    lower.includes('moody') ||
    lower.includes('dark') ||
    lower.includes('dramatic') ||
    lower.includes('shadow') ||
    lower.includes('contrast')

  const isBright =
    lower.includes('bright') ||
    lower.includes('airy') ||
    lower.includes('light') ||
    lower.includes('soft') ||
    lower.includes('negative space')

  const isEditorial =
    lower.includes('editorial') ||
    lower.includes('magazine') ||
    lower.includes('tight') ||
    lower.includes('crop') ||
    lower.includes('detail')

  const isWarm =
    lower.includes('warm') ||
    lower.includes('golden') ||
    lower.includes('sunset') ||
    lower.includes('amber')

  const isCool =
    lower.includes('cool') ||
    lower.includes('blue') ||
    lower.includes('winter') ||
    lower.includes('moody')

  const colorTemp: VibeStyleParams['colorTemp'] = isWarm ? 'warm' : isCool ? 'cool' : 'neutral'

  const presetName = isMoody
    ? 'Moody & Dramatic'
    : isBright
      ? 'Bright & Airy'
      : isEditorial
        ? 'Editorial Tight'
        : 'Custom Style'

  const styleParams: VibeStyleParams = {
    mood: isMoody ? 'dramatic' : isBright ? 'joyful' : isEditorial ? 'editorial' : 'natural',
    lighting: isMoody ? 'low-key' : isBright ? 'high-key' : 'natural',
    composition: isEditorial ? 'tight' : isBright ? 'wide' : 'balanced',
    colorTemp,
    subjects:
      lower.includes('face') || lower.includes('portrait')
        ? ['faces', 'emotion']
        : lower.includes('detail') || lower.includes('texture')
          ? ['details', 'texture']
          : ['faces', 'details'],
    avoidPatterns: isMoody
      ? ['overexposed', 'flat lighting']
      : isBright
        ? ['harsh shadows', 'underexposed']
        : ['blurry', 'poor exposure'],
  }

  return { presetName, styleParams }
}
