import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  const supabase = await createClient()

  // Verify project exists
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, gallery_public')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  // Check access
  if (!project.gallery_public) {
    if (!token) {
      return NextResponse.json({ error: 'Access token required.' }, { status: 401 })
    }

    const { data: access } = await supabase
      .from('gallery_access')
      .select('*')
      .eq('project_id', projectId)
      .eq('token', token)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Invalid access token.' }, { status: 401 })
    }

    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Access token expired.' }, { status: 401 })
    }

    // Must have 'full' access to export
    if (access.access_type !== 'full') {
      return NextResponse.json({ error: 'Full access required for export.' }, { status: 403 })
    }
  }

  // Fetch all media for this project
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('id, filename, display_name, ai_category, storage_path')
    .eq('project_id', projectId)
    .order('ai_category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (mediaError || !media || media.length === 0) {
    return NextResponse.json({ error: 'No media found in this project.' }, { status: 404 })
  }

  // Build ZIP organized by category
  const zip = new JSZip()
  const projectSlug = project.name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')

  // Group files by category
  const grouped: Record<string, typeof media> = {}
  for (const item of media) {
    const category = item.ai_category ?? 'Unsorted'
    if (!grouped[category]) grouped[category] = []
    grouped[category].push(item)
  }

  // Download each file from Supabase Storage and add to ZIP
  let fileIndex = 0
  for (const [category, files] of Object.entries(grouped)) {
    const folder = zip.folder(category)
    if (!folder) continue

    for (const file of files) {
      if (!file.storage_path) continue

      try {
        const { data: blob } = await supabase.storage
          .from('media')
          .download(file.storage_path)

        if (blob) {
          const fileName = file.display_name ?? file.filename ?? `photo_${fileIndex}.jpg`
          folder.file(fileName, blob)
        }
      } catch (err) {
        console.error(`[export] Failed to download ${file.storage_path}:`, err)
        // Skip failed files instead of aborting
      }
      fileIndex++
    }
  }

  // Add metadata CSV
  const csvRows = ['Filename,Category,Original Name']
  for (const item of media) {
    csvRows.push(`"${item.display_name ?? item.filename}","${item.ai_category ?? 'Unsorted'}","${item.filename}"`)
  }
  zip.file('metadata.csv', csvRows.join('\n'))

  // Generate ZIP as Uint8Array
  const zipData = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return new NextResponse(zipData as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${projectSlug}_Export.zip"`,
      'Content-Length': String(zipData.length),
    },
  })
}
