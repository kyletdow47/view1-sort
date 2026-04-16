import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface VisionClassifyResponse {
  description: string
  category: string
  confidence: number
  isAbnormal: boolean
  suggestedCategory?: string
  source: 'claude' | 'cache' | 'degraded'
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { photoUrl, preset, categories, existingDescription } = body as {
    photoUrl?: string
    preset?: string
    categories?: string[]
    existingDescription?: string
  }

  if (!photoUrl || !preset || !Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json(
      { error: 'photoUrl, preset, and categories[] are required' },
      { status: 400 },
    )
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.functions.invoke('vision-classify', {
      body: { photoUrl, preset, categories, existingDescription },
    })

    if (!error && data) {
      return NextResponse.json(data as VisionClassifyResponse)
    }

    if (error) {
      console.warn('[vision-classify] Edge function unavailable:', error.message)
    }
  } catch (err) {
    console.warn('[vision-classify] Edge function call failed:', err)
  }

  // Degraded fallback — let the caller know vision is unavailable.
  // Caller should keep the CLIP result rather than over-ride it.
  return NextResponse.json({
    description: '',
    category: '',
    confidence: 0,
    isAbnormal: false,
    source: 'degraded',
  } satisfies VisionClassifyResponse)
}
