// Supabase Edge Function: generate-captions
// Model: claude-sonnet-4-6 — social media caption generation for photographers
//
// Invoke via: supabase.functions.invoke('generate-captions', { body: { platform, tone, imageDescription, photographerStyle } })

import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CaptionRequest {
  platform: string
  tone?: string
  imageDescription?: string
  photographerStyle?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: CaptionRequest = await req.json()
    const { platform, tone = 'warm', imageDescription = '', photographerStyle = '' } = body

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const client = new Anthropic({ apiKey })

    const systemPrompt = [
      `You are a professional photographer's social media assistant.`,
      photographerStyle ? `The photographer's style: ${photographerStyle}` : '',
      `Write captions that feel authentic, emotional, and on-brand for professional photography.`,
      `Always return exactly 3 caption variants as a JSON object with keys: professional, warm, storytelling.`,
      `Keep captions concise — under 200 characters for TikTok, under 300 for Instagram.`,
    ].filter(Boolean).join('\n')

    const userPrompt = [
      `Platform: ${platform}`,
      `Tone preference: ${tone}`,
      imageDescription ? `Image context: ${imageDescription}` : '',
      `Generate 3 caption variants (professional, warm, storytelling) for this photographer's ${platform} post.`,
      `Return ONLY valid JSON: {"professional": "...", "warm": "...", "storytelling": "..."}`,
    ].filter(Boolean).join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
    let toneVariants: Record<string, string>
    try {
      toneVariants = JSON.parse(rawText) as Record<string, string>
    } catch {
      // Fallback if Claude doesn't return clean JSON
      toneVariants = {
        professional: rawText.slice(0, 200),
        warm: rawText.slice(0, 200),
        storytelling: rawText.slice(0, 200),
      }
    }

    const captions = [
      toneVariants.professional ?? '',
      toneVariants.warm ?? '',
      toneVariants.storytelling ?? '',
    ].filter(Boolean)

    return new Response(
      JSON.stringify({ captions, tone_variants: toneVariants, source: 'claude' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-captions]', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
