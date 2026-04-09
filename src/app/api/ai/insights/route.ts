import { NextRequest, NextResponse } from 'next/server'

// TODO: Wire to Claude API (claude-sonnet-4-6) via Supabase Edge Function.
// See ARCHITECTURE-DECISIONS.md Decision 2 — AI Architecture (server-side language tasks).
//
// Implementation plan:
//   1. Fetch the photographer's aggregate stats from Supabase (projects, bookings, invoices, galleries)
//   2. Build a system prompt with the photographer's real data as context
//   3. Call claude-sonnet-4-6 with the user's natural-language question
//   4. Stream the response back via ReadableStream
//
// For now this stub returns mock data to unblock UI development.

const MOCK_ANSWER =
  'Based on your data: Your busiest months are September–November, accounting for 48% of annual bookings. ' +
  'Wedding photography generates 62% of your revenue at an average of $3,800 per shoot. ' +
  'Your average delivery time is 9 days — 3 days above the industry average of 6 days. ' +
  'Raising your wedding package price by 15–20% could increase annual revenue by ~$8,400 without meaningfully reducing bookings. ' +
  'Your client retention rate of 42% is above average — focus on nurturing family portrait clients for repeat business.'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { prompt, stats } = body as {
    prompt?: string
    stats?: {
      totalPhotos: number
      categoryCounts: Record<string, number>
      qualityDistribution: { high: number; medium: number; low: number }
      duplicateCount?: number
      blurryCount?: number
    }
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  // Try Supabase Edge Function (backed by claude-haiku-4-5-20251001) when stats provided
  if (stats) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { stats },
      })
      if (!error && data) {
        return NextResponse.json({ answer: (data as { insights: string[] }).insights?.join('\n\n') ?? '', insights: (data as { insights: string[] }).insights, source: 'claude' })
      }
      if (error) {
        console.warn('[insights] Edge function unavailable, using mock:', error.message)
      }
    } catch (err) {
      console.warn('[insights] Edge function call failed, using mock:', err)
    }
  }

  return NextResponse.json({
    answer: MOCK_ANSWER,
    source: 'mock',
  })
}
