/**
 * Local-media blob store (IndexedDB).
 *
 * After an AI sort the user can "Save to Project" without paying Supabase
 * storage costs. The photo blobs live in IndexedDB keyed by
 * `{projectId}:{sha256}`; Supabase only sees lightweight `media` rows whose
 * `storage_path` is `local:{sha256}`. A real cloud upload only happens later
 * when the user publishes a gallery to a client.
 */

const DB_NAME = 'v1-local-media'
const DB_VERSION = 1
const STORE_NAME = 'photos'

export interface LocalMediaRecord {
  key: string
  projectId: string
  hash: string
  blob: Blob
  filename: string
  mimeType: string
  sizeBytes: number
  category: string | null
  createdAt: number
}

export interface SortedFile {
  file: File
  category: string | null
}

/* ─── IndexedDB plumbing ────────────────────────────────────────────── */

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error('IndexedDB is only available in the browser'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        store.createIndex('projectId', 'projectId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode,
): IDBObjectStore {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

/* ─── Hashing ──────────────────────────────────────────────────────── */

export async function sha256(file: File | Blob): Promise<string> {
  const buf = await file.arrayBuffer()
  const hashBuf = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function buildKey(projectId: string, hash: string): string {
  return `${projectId}:${hash}`
}

/** Parse a `local:{hash}` storage_path. Returns `null` for non-local paths. */
export function parseLocalStoragePath(storagePath: string): string | null {
  if (!storagePath.startsWith('local:')) return null
  return storagePath.slice('local:'.length)
}

export function buildLocalStoragePath(hash: string): string {
  return `local:${hash}`
}

/* ─── Put / Get ────────────────────────────────────────────────────── */

export async function putLocalPhoto(
  projectId: string,
  file: File,
  category: string | null = null,
): Promise<LocalMediaRecord> {
  const hash = await sha256(file)
  const record: LocalMediaRecord = {
    key: buildKey(projectId, hash),
    projectId,
    hash,
    blob: file,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    category,
    createdAt: Date.now(),
  }
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, 'readwrite').put(record)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  db.close()
  return record
}

export async function putSortedPhotos(
  projectId: string,
  files: SortedFile[],
): Promise<LocalMediaRecord[]> {
  const records: LocalMediaRecord[] = []
  for (const { file, category } of files) {
    records.push(await putLocalPhoto(projectId, file, category))
  }
  return records
}

export async function getLocalPhoto(
  projectId: string,
  hash: string,
): Promise<LocalMediaRecord | null> {
  const db = await openDb()
  const record = await new Promise<LocalMediaRecord | null>((resolve, reject) => {
    const req = tx(db, 'readonly').get(buildKey(projectId, hash))
    req.onsuccess = () => resolve((req.result as LocalMediaRecord | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return record
}

export async function listLocalPhotos(projectId: string): Promise<LocalMediaRecord[]> {
  const db = await openDb()
  const records = await new Promise<LocalMediaRecord[]>((resolve, reject) => {
    const store = tx(db, 'readonly')
    const index = store.index('projectId')
    const req = index.getAll(projectId)
    req.onsuccess = () => resolve((req.result as LocalMediaRecord[]) ?? [])
    req.onerror = () => reject(req.error)
  })
  db.close()
  return records
}

export async function deleteLocalPhoto(
  projectId: string,
  hash: string,
): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(buildKey(projectId, hash))
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  db.close()
}

/* ─── Blob URL cache ───────────────────────────────────────────────── */

const urlCache = new Map<string, string>()

export function getCachedBlobUrl(projectId: string, hash: string): string | null {
  return urlCache.get(buildKey(projectId, hash)) ?? null
}

export async function resolveLocalBlobUrl(
  projectId: string,
  hash: string,
): Promise<string | null> {
  const key = buildKey(projectId, hash)
  const cached = urlCache.get(key)
  if (cached) return cached
  const record = await getLocalPhoto(projectId, hash)
  if (!record) return null
  const url = URL.createObjectURL(record.blob)
  urlCache.set(key, url)
  return url
}

export function revokeCachedBlobUrls(): void {
  for (const url of urlCache.values()) URL.revokeObjectURL(url)
  urlCache.clear()
}
