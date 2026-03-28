const ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

export function getImageUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${ACCOUNT_ID}/${imageId}/${variant}`
}

export function getThumbnailUrl(imageId: string): string {
  return getImageUrl(imageId, 'thumbnail')
}

export function getWatermarkUrl(imageId: string): string {
  return getImageUrl(imageId, 'watermark')
}

export async function uploadToCloudflare(file: File | Blob, filename: string): Promise<{ imageId: string; thumbnailUrl: string; watermarkUrl: string } | null> {
  if (!ACCOUNT_ID || !API_TOKEN) {
    console.warn('[cloudflare] Missing credentials — skipping upload')
    return null
  }

  const formData = new FormData()
  formData.append('file', file, filename)

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: formData,
  })

  if (!res.ok) {
    console.error('[cloudflare] Upload failed:', await res.text())
    return null
  }

  const data = await res.json()
  const imageId = data.result?.id
  if (!imageId) return null

  return {
    imageId,
    thumbnailUrl: getThumbnailUrl(imageId),
    watermarkUrl: getWatermarkUrl(imageId),
  }
}
