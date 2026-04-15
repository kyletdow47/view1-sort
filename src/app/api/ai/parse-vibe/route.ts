import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import type { ParseVibeRequest, ParseVibeResponse, VibeStyleParams } from '@/types/vibe-presets'

/**
 * POST /api/ai/parse-vibe
 *
 * Thin wrapper around the sort-conversation Edge Function (Brain 2).
 *
 * The vibe preset system is now a view on top of the conversation engine:
 * the photographer's style description becomes a "brief", Claude interprets
 * it, and we derive a preset name from its reasoning plus style params
 * from keyword analysis of the original description.
 *
 * If the Edge Function call fails or ANTHROPIC_API_KEY is missing, we fall
 * back to pure heuristic extraction so the vibe preset UI never breaks.
 */

interface BriefResponse {
  type: 'brief'
  proposedCategories: Array<{
    name: string
    description: string
    matchLabels: string[]
    priority: number
  }>
  followUpQuestions: string[]
  confidence: number
  reasoning: string
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ParseVibeRequest
    const { description, projectId } = body

    if (!description?.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    const styleParams = extractStyleParams(description)
    let presetName = derivePresetName(description)

    // Try to enrich with Claude via the sort-conversation Edge Function.
    // If it fails, we still have heuristic results — no user-facing error.
    try {
      const supabase = getServiceSupabase()
      const { data, error } = await supabase.functions.invoke('sort-conversation', {
        body: {
          mode: 'brief',
          projectId: projectId ?? 'vibe-preset',
          message: description,
        },
      })

      if (!error && data && (data as BriefResponse).type === 'brief') {
        const brief = data as BriefResponse
        const claudeName = extractPresetNameFromReasoning(brief.reasoning, brief.proposedCategories)
        if (claudeName) presetName = claudeName
      }
    } catch (edgeErr) {
      const msg = edgeErr instanceof Error ? edgeErr.message : 'Unknown error'
      console.warn('[parse-vibe] Edge Function unavailable, using heuristic:', msg)
    }

    const response: ParseVibeResponse = { presetName, styleParams }
    return NextResponse.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/ai/parse-vibe]', message)
    return NextResponse.json({ error: 'Failed to parse vibe description' }, { status: 500 })
  }
}

/**
 * Pull a short, human-friendly preset name from Claude's reasoning.
 * Falls back to the first proposed category name.
 */
function extractPresetNameFromReasoning(
  reasoning: string,
  categories: BriefResponse['proposedCategories']
): string | null {
  if (categories && categories.length > 0 && categories[0].name) {
    return categories[0].name
  }
  // Grab the first 3-4 meaningful words of reasoning
  const words = reasoning.split(/\s+/).filter((w) => w.length > 2).slice(0, 3)
  if (words.length === 0) return null
  return words.map(capitalize).join(' ')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/[^a-z]/g, '')
}

function derivePresetName(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes('moody') || lower.includes('dramatic')) return 'Moody & Dramatic'
  if (lower.includes('bright') || lower.includes('airy')) return 'Bright & Airy'
  if (lower.includes('editorial') || lower.includes('magazine')) return 'Editorial Tight'
  return 'Custom Style'
}

/**
 * Keyword-based style parameter extractor.
 * Runs as a deterministic fallback and as the primary source of style params
 * (the Edge Function returns categories, not mood/lighting/composition).
 */
function extractStyleParams(description: string): VibeStyleParams {
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

  return {
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
}
