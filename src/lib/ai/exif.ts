/**
 * EXIF metadata extraction for uploaded photos.
 * Uses exifreader to pull camera info, timestamps, and GPS from image files.
 */

import ExifReader from 'exifreader'

export interface ExifData {
  dateTaken: string | null
  cameraMake: string | null
  cameraModel: string | null
  focalLength: number | null
  aperture: number | null
  iso: number | null
  shutterSpeed: string | null
  gpsLat: number | null
  gpsLng: number | null
  flash: boolean | null
}

const EMPTY_EXIF: ExifData = {
  dateTaken: null,
  cameraMake: null,
  cameraModel: null,
  focalLength: null,
  aperture: null,
  iso: null,
  shutterSpeed: null,
  gpsLat: null,
  gpsLng: null,
  flash: null,
}

/**
 * Extract EXIF metadata from an image file.
 * Returns a normalized ExifData object with null for missing fields.
 */
export async function extractExif(file: File | ArrayBuffer): Promise<ExifData> {
  try {
    const buffer = file instanceof File ? await file.arrayBuffer() : file
    const tags = ExifReader.load(buffer, { expanded: true })

    const exifGroup = tags.exif ?? {}
    const gpsGroup = tags.gps ?? {}

    const dateTaken = parseExifDate(
      exifGroup.DateTimeOriginal?.description ??
      exifGroup.DateTimeDigitized?.description ??
      null
    )

    const cameraMake = exifGroup.Make?.description?.trim() ?? null
    const cameraModel = exifGroup.Model?.description?.trim() ?? null

    const focalLength = exifGroup.FocalLength?.value
      ? Number(exifGroup.FocalLength.value)
      : null

    const aperture = exifGroup.FNumber?.value
      ? Number(exifGroup.FNumber.value)
      : null

    const iso = exifGroup.ISOSpeedRatings?.value
      ? Number(exifGroup.ISOSpeedRatings.value)
      : null

    const shutterSpeed = exifGroup.ExposureTime?.description ?? null

    const gpsLat = typeof gpsGroup.Latitude === 'number' ? gpsGroup.Latitude : null
    const gpsLng = typeof gpsGroup.Longitude === 'number' ? gpsGroup.Longitude : null

    const flashValue = exifGroup.Flash?.value
    const flash = typeof flashValue === 'number' ? (flashValue & 1) === 1 : null

    return {
      dateTaken,
      cameraMake,
      cameraModel,
      focalLength,
      aperture,
      iso,
      shutterSpeed,
      gpsLat,
      gpsLng,
      flash,
    }
  } catch {
    // EXIF parsing can fail on non-JPEG files or corrupted headers
    return { ...EMPTY_EXIF }
  }
}

/**
 * Parse EXIF date format "YYYY:MM:DD HH:MM:SS" into ISO string.
 */
function parseExifDate(raw: string | null): string | null {
  if (!raw) return null
  // EXIF dates use colons: "2024:06:15 14:30:00"
  const match = raw.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return null
  const [, year, month, day, hour, min, sec] = match
  return `${year}-${month}-${day}T${hour}:${min}:${sec}`
}

/**
 * Format camera info as a human-readable string.
 */
export function formatCamera(exif: ExifData): string | null {
  if (!exif.cameraMake && !exif.cameraModel) return null
  const make = exif.cameraMake ?? ''
  const model = exif.cameraModel ?? ''
  // Avoid duplication (e.g. "Canon Canon EOS R5")
  if (model.toLowerCase().startsWith(make.toLowerCase())) return model
  return `${make} ${model}`.trim()
}
