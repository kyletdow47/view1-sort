import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/ai/sort-conversation
 *
 * Proxies to the sort-conversation Supabase Edge Function (Brain 2).
 * Handles auth validation and passes the request through.
 *
 * Body: {
 *   mode: 'brief' | 'followup' | 'plan'
 *   projectId: string
 *   message: string
 *   batchSummary?: string
 *   memoryProfile?: string
 *   previousContext?: string
 * }
 */

interface SortConversationBody {
  mode: 'brief' | 'followup' | 'plan'
  projectId: string
  message: string
  batchSummary?: string
  memoryProfile?: string
  previousContext?: string
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
    const body = (await req.json()) as SortConversationBody
    const { mode, projectId, message, batchSummary, memoryProfile, previousContext } = body

    if (!mode || !['brief', 'followup', 'plan'].includes(mode)) {
      return NextResponse.json({ error: 'mode must be "brief", "followup", or "plan"' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('sort-conversation', {
      body: { mode, projectId, message, batchSummary, memoryProfile, previousContext },
    })

    if (error) {
      console.error('[sort-conversation] Edge Function error:', error.message)
      return NextResponse.json(
        { error: `Sort conversation failed: ${error.message}` },
        { status: 502 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/ai/sort-conversation]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
