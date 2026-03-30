import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Media } from '@/types/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface IncomingFile {
  filename: string
  /** Lightweight fingerprint: "{size_bytes}_{lastModified_ms}" */
  checksum: string
}

interface SyncDetectBody {
  files: IncomingFile[]
}

interface ChangedFile {
  mediaId: string
  filename: string
  /** True if this file has never been baselined before */
  isBaseline: boolean
}

interface SyncDetectResponse {
  changed: ChangedFile[]
  baselined: number
  total: number
}

/**
 * POST /api/projects/[id]/lightroom-sync
 *
 * Accepts a list of files with their checksums from the photographer's
 * Lightroom export folder. Compares against stored file_checksum values to
 * detect which photos have been modified since the last sync.
 *
 * First call for a file: stores checksum as baseline (no change).
 * Subsequent calls: detects checksum drift = file was edited.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params
    const body = (await request.json()) as SyncDetectBody

    if (!Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json({ error: 'files array is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Auth check — must be the project owner
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all media for this project
    const { data: mediaRows, error: mediaError } = await supabase
      .from('media')
      .select('id, filename, file_checksum, edited_at')
      .eq('project_id', projectId)

    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 })
    }

    const mediaMap = new Map<string, Pick<Media, 'id' | 'filename' | 'file_checksum' | 'edited_at'>>(
      (mediaRows ?? []).map((m) => [
        m.filename,
        m as Pick<Media, 'id' | 'filename' | 'file_checksum' | 'edited_at'>,
      ])
    )

    const changed: ChangedFile[] = []
    const baselineUpdates: Array<{ id: string; file_checksum: string }> = []
    let baselinedCount = 0

    for (const incoming of body.files) {
      const existing = mediaMap.get(incoming.filename)
      if (!existing) continue // file not in this project, skip

      if (existing.file_checksum === null) {
        // First scan — store as baseline, do NOT flag as changed
        baselineUpdates.push({ id: existing.id, file_checksum: incoming.checksum })
        baselinedCount++
      } else if (existing.file_checksum !== incoming.checksum) {
        // Checksum has changed since last known state → file was edited
        changed.push({ mediaId: existing.id, filename: existing.filename, isBaseline: false })
      }
    }

    // Persist baseline checksums in bulk
    if (baselineUpdates.length > 0) {
      await Promise.all(
        baselineUpdates.map(({ id, file_checksum }) =>
          supabase.from('media').update({ file_checksum }).eq('id', id)
        )
      )
    }

    const response: SyncDetectResponse = {
      changed,
      baselined: baselinedCount,
      total: body.files.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Lightroom sync detect error:', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
