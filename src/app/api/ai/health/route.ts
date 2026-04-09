import { NextResponse } from 'next/server'

interface HealthResponse {
  status: 'connected' | 'not_configured' | 'error'
  message: string
}

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Try a lightweight invocation — the edge function will fail fast if no API key
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: {
        stats: {
          totalPhotos: 1,
          categoryCounts: { test: 1 },
          qualityDistribution: { high: 1, medium: 0, low: 0 },
        },
      },
    })

    if (error) {
      const msg = typeof error.message === 'string' ? error.message : 'Unknown error'
      // Distinguish between API key missing vs other errors
      if (msg.includes('ANTHROPIC_API_KEY') || msg.includes('API_KEY_MISSING')) {
        const response: HealthResponse = {
          status: 'not_configured',
          message: 'ANTHROPIC_API_KEY is not set in Supabase Edge Function secrets.',
        }
        return NextResponse.json(response)
      }

      const response: HealthResponse = {
        status: 'error',
        message: `Edge function error: ${msg}`,
      }
      return NextResponse.json(response)
    }

    if (data) {
      const response: HealthResponse = {
        status: 'connected',
        message: 'Claude AI is connected and responding.',
      }
      return NextResponse.json(response)
    }

    const response: HealthResponse = {
      status: 'error',
      message: 'Unexpected empty response from edge function.',
    }
    return NextResponse.json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const response: HealthResponse = {
      status: 'error',
      message: `Connection test failed: ${msg}`,
    }
    return NextResponse.json(response)
  }
}
