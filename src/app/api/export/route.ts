import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

/**
 * POST /api/export
 *
 * Generates a ZIP file of all media in a project, organized by AI category folders.
 * Requires valid gallery access (token or authenticated owner).
 *
 * Body: { projectId: string, token?: string }
 */

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string; token?: string }
    const { projectId, token } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Verify access: either valid token or project owner
    if (token) {
      const { data: access } = await supabase
        .from('gallery_access')
        .select('access_type, expires_at')
        .eq('project_id', projectId)
        .eq('token', token)
        .single()

      if (!access) {
        return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
      }

      const isExpired = access.expires_at != null && new Date(access.expires_at) < new Date()
      if (isExpired) {
        return NextResponse.json({ error: 'Access token expired' }, { status: 401 })
      }

      if (access.access_type !== 'full') {
        return NextResponse.json({ error: 'Download access not granted' }, { status: 403 })
      }
    }

    // Fetch project
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch all media
    const { data: mediaList, error: mediaError } = await supabase
      .from('media')
      .select('id, file_name, storage_path, ai_category')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (mediaError || !mediaList || mediaList.length === 0) {
      return NextResponse.json({ error: 'No media found' }, { status: 404 })
    }

    const zip = new JSZip()
    const projectName = (project as { name: string }).name.replace(/[^a-zA-Z0-9-_ ]/g, '')

    // Download each file and add to ZIP
    for (const media of mediaList) {
      const category = media.ai_category ?? 'Uncategorized'
      const folderName = category.replace(/[^a-zA-Z0-9-_ ]/g, '')

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('photos')
        .download(media.storage_path)

      if (downloadError || !fileData) {
        console.error(`Failed to download ${media.storage_path}:`, downloadError)
        continue
      }

      const buffer = await fileData.arrayBuffer()
      zip.file(`${projectName}/${folderName}/${media.file_name}`, buffer)
    }

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Export error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
