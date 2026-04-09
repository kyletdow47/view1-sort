// Supabase Edge Function: parse-vibe
// Model: claude-haiku-4-5-20251001 — fast structured extraction of style parameters
//
// Invoke via: supabase.functions.invoke('parse-vibe', { body: { description, projectId } })

import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: { description: string; projectId?: string } = await req.json()
    const { description } = body

    if (!description?.trim()) {
      return new Response(
        JSON.stringify({ error: 'description is required' }),
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

    const systemPrompt = `You are a photography style AI assistant.
Extract style parameters from natural language descriptions and return structured JSON.
Always return valid JSON matching exactly this schema:
{
  "presetName": "string — short evocative name for the style",
  "styleParams": {
    "mood": "dramatic" | "joyful" | "editorial" | "natural" | "romantic" | "moody",
    "lighting": "low-key" | "high-key" | "natural" | "golden-hour" | "studio",
    "composition": "tight" | "wide" | "balanced" | "documentary",
    "colorTemp": "warm" | "cool" | "neutral",
    "subjects": ["array", "of", "focus", "subjects"],
    "avoidPatterns": ["array", "of", "patterns", "to", "avoid"]
  }
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Extract style parameters from this photography description: "${description}"\n\nReturn ONLY valid JSON, no explanation.`,
        },
      ],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '{}'

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[parse-vibe]', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
