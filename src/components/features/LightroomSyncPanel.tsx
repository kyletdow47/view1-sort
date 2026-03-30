'use client'

import { useCallback, useState } from 'react'
import { AlertCircle, CheckCircle2, FolderOpen, RefreshCw, Upload } from 'lucide-react'

interface ChangedFile {
  mediaId: string
  filename: string
  isBaseline: boolean
}

interface LightroomSyncPanelProps {
  projectId: string
  onSyncComplete?: (updatedCount: number) => void
}

type SyncPhase = 'idle' | 'scanning' | 'detected' | 'uploading' | 'done' | 'error'

interface FileEntry {
  file: File
  mediaId: string
  filename: string
  checksum: string
}

function computeChecksum(file: File): string {
  return `${file.size}_${file.lastModified}`
}

export function LightroomSyncPanel({ projectId, onSyncComplete }: LightroomSyncPanelProps) {
  const [phase, setPhase] = useState<SyncPhase>('idle')
  const [changedFiles, setChangedFiles] = useState<FileEntry[]>([])
  const [baselined, setBaselined] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSelectFolder = useCallback(async () => {
    setPhase('scanning')
    setErrorMsg(null)

    try {
      let files: File[] = []

      // Use File System Access API if available (Chrome/Edge)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (
          window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
        ).showDirectoryPicker()

        const imageFiles: File[] = []
        for await (const entry of (dirHandle as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
          const [, handle] = entry as [string, FileSystemHandle]
          if (
            handle.kind === 'file' &&
            /\.(jpe?g|png|tiff?|webp|heic|heif|cr2|cr3|nef|arw|raf|dng)$/i.test(handle.name)
          ) {
            const fileHandle = handle as FileSystemFileHandle
            const f = await fileHandle.getFile()
            imageFiles.push(f)
          }
        }
        files = imageFiles
      } else {
        // Fallback: hidden <input type="file" multiple> with webkitdirectory
        files = await pickFilesViaInput()
      }

      if (files.length === 0) {
        setPhase('idle')
        return
      }

      // Build payload
      const payload = files.map((f) => ({
        filename: f.name,
        checksum: computeChecksum(f),
      }))

      // Call detect API
      const res = await fetch(`/api/projects/${projectId}/lightroom-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: payload }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Detection failed')
      }

      const result = (await res.json()) as {
        changed: ChangedFile[]
        baselined: number
        total: number
      }

      setBaselined(result.baselined)

      if (result.changed.length === 0) {
        setPhase('detected')
        setChangedFiles([])
        return
      }

      // Build FileEntry list — match files to changed mediaIds
      const changedFilenames = new Set(result.changed.map((c) => c.filename))
      const entries: FileEntry[] = []

      for (const f of files) {
        if (!changedFilenames.has(f.name)) continue
        const meta = result.changed.find((c) => c.filename === f.name)
        if (!meta) continue
        entries.push({
          file: f,
          mediaId: meta.mediaId,
          filename: f.name,
          checksum: computeChecksum(f),
        })
      }

      setChangedFiles(entries)
      setPhase('detected')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setPhase('idle')
        return
      }
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(msg)
      setPhase('error')
    }
  }, [projectId])

  const handleApplyEdits = useCallback(async () => {
    if (changedFiles.length === 0) return
    setPhase('uploading')
    setUploadedCount(0)
    let uploaded = 0

    for (const entry of changedFiles) {
      try {
        const form = new FormData()
        form.append('file', entry.file)
        form.append('checksum', entry.checksum)

        const res = await fetch(`/api/media/${entry.mediaId}/sync-edit`, {
          method: 'POST',
          body: form,
        })

        if (!res.ok) {
          const err = (await res.json()) as { error?: string }
          console.error(`Failed to sync ${entry.filename}:`, err.error)
          continue
        }

        uploaded++
        setUploadedCount(uploaded)
      } catch (err) {
        console.error(`Error uploading ${entry.filename}:`, err)
      }
    }

    setPhase('done')
    onSyncComplete?.(uploaded)
  }, [changedFiles, onSyncComplete])

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
          <RefreshCw size={16} className="text-[#4e2600]" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-on-surface text-sm">Lightroom Roundtrip Sync</h3>
          <p className="text-xs text-on-surface-variant">
            Auto-detect edited photos from your Lightroom export folder
          </p>
        </div>
      </div>

      {/* Body */}
      {phase === 'idle' && (
        <button
          onClick={handleSelectFolder}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:border-[#ffb780]/50 hover:text-on-surface"
        >
          <FolderOpen size={16} />
          Select Lightroom Export Folder
        </button>
      )}

      {phase === 'scanning' && (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant py-2">
          <RefreshCw size={14} className="animate-spin" />
          Scanning folder…
        </div>
      )}

      {phase === 'detected' && changedFiles.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={14} />
            {baselined > 0
              ? `Baseline set for ${baselined} photo${baselined !== 1 ? 's' : ''}. No edits detected yet.`
              : 'All photos are up to date — no edits detected.'}
          </div>
          <button
            onClick={() => setPhase('idle')}
            className="text-xs text-on-surface-variant hover:text-on-surface underline"
          >
            Scan again
          </button>
        </div>
      )}

      {phase === 'detected' && changedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-[#ffb780]">{changedFiles.length}</span>{' '}
            photo{changedFiles.length !== 1 ? 's' : ''} edited in Lightroom
          </p>

          {/* File list */}
          <ul className="max-h-40 overflow-y-auto space-y-1">
            {changedFiles.map((entry) => (
              <li
                key={entry.mediaId}
                className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#ffb780]" />
                <span className="text-xs font-mono text-on-surface truncate">{entry.filename}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyEdits}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-4 py-2 text-sm font-semibold text-[#4e2600] transition-opacity hover:opacity-90"
            >
              <Upload size={14} />
              Apply {changedFiles.length} Edit{changedFiles.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={() => setPhase('idle')}
              className="text-xs text-on-surface-variant hover:text-on-surface underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {phase === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <RefreshCw size={14} className="animate-spin" />
            Uploading edited photos… ({uploadedCount} / {changedFiles.length})
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441] transition-all duration-300"
              style={{ width: `${(uploadedCount / changedFiles.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={14} />
            {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} synced. Edited versions are now live in the gallery.
          </div>
          <button
            onClick={() => {
              setPhase('idle')
              setChangedFiles([])
              setUploadedCount(0)
            }}
            className="text-xs text-on-surface-variant hover:text-on-surface underline"
          >
            Scan again
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={14} />
            {errorMsg ?? 'Something went wrong'}
          </div>
          <button
            onClick={() => setPhase('idle')}
            className="text-xs text-on-surface-variant hover:text-on-surface underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Fallback: hidden file input                                         */
/* ------------------------------------------------------------------ */

function pickFilesViaInput(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*,.cr2,.cr3,.nef,.arw,.raf,.dng'
    // webkitdirectory allows selecting a folder in most browsers
    input.setAttribute('webkitdirectory', '')
    input.onchange = () => {
      resolve(Array.from(input.files ?? []))
    }
    input.oncancel = () => resolve([])
    input.click()
  })
}
