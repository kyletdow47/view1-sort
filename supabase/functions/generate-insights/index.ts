// Supabase Edge Function: generate-insights
// Model: claude-haiku-4-5-20251001 — fast gallery/shoot analysis insights
//
// Invoke via: supabase.functions.invoke('generate-insights', { body: { stats } })

import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GalleryStats {
  totalPhotos: number
  categoryCounts: Record<string, number>
  qualityDistribution: { high: number; medium: number; low: number }
  duplicateCount?: number
  blurryCount?: number
  overexposedCount?: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: { stats: GalleryStats } = await req.json()
    const { stats } = body

    if (!stats) {
      return new Response(
        JSON.stringify({ error: 'stats is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const client = new Anthropic({ apiKey })

    const highPct = Math.round((stats.qualityDistribution.high / stats.totalPhotos) * 100)
    const medPct = Math.round((stats.qualityDistribution.medium / stats.totalPhotos) * 100)
    const categoryBreakdown = Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => `  ${cat}: ${count} (${Math.round((count / stats.totalPhotos) * 100)}%)`)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Analyze this photography shoot and provide 3-5 actionable insights.

Shoot stats:
- Total photos: ${stats.totalPhotos}
- High confidence (≥90%): ${stats.qualityDistribution.high} (${highPct}%)
- Medium confidence (70-90%): ${stats.qualityDistribution.medium} (${medPct}%)
- Low confidence (<70%): ${stats.qualityDistribution.low}
${stats.duplicateCount ? `- Duplicates detected: ${stats.duplicateCount}` : ''}
${stats.blurryCount ? `- Blurry photos: ${stats.blurryCount}` : ''}
${stats.overexposedCount ? `- Overexposed photos: ${stats.overexposedCount}` : ''}

Category breakdown:
${categoryBreakdown}

Return a JSON array of 3-5 insight strings. Each insight should be specific, data-driven, and actionable.
Example format: ["82% of your portrait shots are sharp — excellent technical consistency", ...]
Return ONLY a valid JSON array, no explanation.`,
        },
      ],
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '[]'
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const insights = JSON.parse(cleaned) as string[]

    return new Response(
      JSON.stringify({ insights, source: 'claude' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-insights]', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
