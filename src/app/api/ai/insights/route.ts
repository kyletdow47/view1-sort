import { NextRequest, NextResponse } from 'next/server'

interface GalleryStats {
  totalPhotos: number
  categoryCounts: Record<string, number>
  qualityDistribution: { high: number; medium: number; low: number }
  duplicateCount?: number
  blurryCount?: number
  overexposedCount?: number
}

interface InsightsResponse {
  insights: string[]
  source: 'claude' | 'cache' | 'fallback'
}

const MOCK_INSIGHTS: string[] = [
  'Your portrait category dominates at 45% of your portfolio — consider creating a specialized portrait pricing package.',
  'High-confidence photos make up 78% of your library. Your technical consistency is above average.',
  'You have 23 duplicate shots that could be culled to streamline delivery times.',
  'Wedding shots have the highest average quality score — this could be your strongest marketing vertical.',
  'Consider re-sorting 12 photos with low confidence scores to improve gallery curation.',
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { stats, projectId, photographerNiche } = body as {
    stats?: GalleryStats
    projectId?: string
    photographerNiche?: string
  }

  // Try Supabase Edge Function when stats are provided
  if (stats && stats.totalPhotos > 0) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { stats, projectId, photographerNiche },
      })

      if (!error && data) {
        const result = data as { insights: string[]; source: string }
        const response: InsightsResponse = {
          insights: result.insights ?? [],
          source: (result.source === 'cache' ? 'cache' : 'claude'),
        }
        return NextResponse.json(response)
      }

      if (error) {
        console.warn('[insights] Edge function unavailable, using fallback:', error.message)
      }
    } catch (err) {
      console.warn('[insights] Edge function call failed, using fallback:', err)
    }
  }

  // Fallback mock insights
  const response: InsightsResponse = {
    insights: MOCK_INSIGHTS,
    source: 'fallback',
  }
  return NextResponse.json(response)
}
