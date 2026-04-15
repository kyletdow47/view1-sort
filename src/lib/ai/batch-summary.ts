/**
 * Batch summary generator.
 *
 * Takes an array of PhotoScan results from the batch scanner and produces
 * a structured summary for Brain 2 (Claude conversation engine).
 *
 * The summary includes:
 * - Photo count and time span
 * - Category breakdown with counts and confidence
 * - Quality overview (sharp, acceptable, flagged)
 * - Scene transitions detected from timestamps
 * - Camera models used
 * - A natural-language summaryText for Claude to read
 */

import { formatCamera } from './exif'
import type { PhotoScan } from './batch-scanner'
import type { PhotoCategory } from './labels'

export interface BatchSummary {
  totalPhotos: number
  timespan: {
    earliest: string
    latest: string
    durationHours: number
  } | null
  categoryBreakdown: Array<{
    category: string
    count: number
    percentage: number
    avgConfidence: number
  }>
  qualityOverview: {
    sharp: number
    acceptable: number
    flagged: number
    duplicateGroups: number
    blurry: number
    overexposed: number
    underexposed: number
  }
  cameras: string[]
  summaryText: string
}

/**
 * Generate a structured summary from scan results.
 */
export function generateBatchSummary(scans: PhotoScan[]): BatchSummary {
  if (scans.length === 0) {
    return {
      totalPhotos: 0,
      timespan: null,
      categoryBreakdown: [],
      qualityOverview: { sharp: 0, acceptable: 0, flagged: 0, duplicateGroups: 0, blurry: 0, overexposed: 0, underexposed: 0 },
      cameras: [],
      summaryText: 'No photos to analyze.',
    }
  }

  const totalPhotos = scans.length
  const timespan = computeTimespan(scans)
  const categoryBreakdown = computeCategoryBreakdown(scans)
  const qualityOverview = computeQualityOverview(scans)
  const cameras = computeCameras(scans)
  const summaryText = buildSummaryText(totalPhotos, timespan, categoryBreakdown, qualityOverview, cameras)

  return {
    totalPhotos,
    timespan,
    categoryBreakdown,
    qualityOverview,
    cameras,
    summaryText,
  }
}

function computeTimespan(scans: PhotoScan[]): BatchSummary['timespan'] {
  const dates = scans
    .map((s) => s.exif.dateTaken)
    .filter((d): d is string => d !== null)
    .sort()

  if (dates.length < 2) return null

  const earliest = dates[0]
  const latest = dates[dates.length - 1]
  const durationMs = new Date(latest).getTime() - new Date(earliest).getTime()
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10

  return { earliest, latest, durationHours }
}

function computeCategoryBreakdown(scans: PhotoScan[]): BatchSummary['categoryBreakdown'] {
  const counts = new Map<string, { count: number; totalConfidence: number }>()

  for (const scan of scans) {
    const topLabel = scan.topLabels[0]
    if (!topLabel) continue

    const category = topLabel.category
    const existing = counts.get(category) ?? { count: 0, totalConfidence: 0 }
    existing.count++
    existing.totalConfidence += topLabel.score
    counts.set(category, existing)
  }

  return Array.from(counts.entries())
    .map(([category, { count, totalConfidence }]) => ({
      category,
      count,
      percentage: Math.round((count / scans.length) * 100),
      avgConfidence: Math.round((totalConfidence / count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count)
}

function computeQualityOverview(scans: PhotoScan[]): BatchSummary['qualityOverview'] {
  let sharp = 0
  let acceptable = 0
  let flagged = 0
  let blurry = 0
  let overexposed = 0
  let underexposed = 0
  const dupGroups = new Set<string>()

  for (const scan of scans) {
    const hasFlags = scan.quality.flags.length > 0
    if (!hasFlags) {
      sharp++
    } else {
      const hasSevereFlag = scan.quality.flags.some((f) => f.confidence > 0.7)
      if (hasSevereFlag) {
        flagged++
      } else {
        acceptable++
      }
    }

    if (scan.quality.flags.some((f) => f.type === 'blurry')) blurry++
    if (scan.quality.flags.some((f) => f.type === 'overexposed')) overexposed++
    if (scan.quality.flags.some((f) => f.type === 'underexposed')) underexposed++
    if (scan.duplicateGroupId) dupGroups.add(scan.duplicateGroupId)
  }

  return { sharp, acceptable, flagged, duplicateGroups: dupGroups.size, blurry, overexposed, underexposed }
}

function computeCameras(scans: PhotoScan[]): string[] {
  const cameraSet = new Set<string>()
  for (const scan of scans) {
    const camera = formatCamera(scan.exif)
    if (camera) cameraSet.add(camera)
  }
  return Array.from(cameraSet).sort()
}

/**
 * Build a natural-language summary paragraph for Brain 2 (Claude) to read.
 * This is the key bridge between the Eyes and the Mind.
 */
function buildSummaryText(
  totalPhotos: number,
  timespan: BatchSummary['timespan'],
  breakdown: BatchSummary['categoryBreakdown'],
  quality: BatchSummary['qualityOverview'],
  cameras: string[]
): string {
  const parts: string[] = []

  // Photo count and timespan
  if (timespan) {
    parts.push(`${totalPhotos} photos taken over ${timespan.durationHours} hours.`)
  } else {
    parts.push(`${totalPhotos} photos.`)
  }

  // Category breakdown (top categories)
  if (breakdown.length > 0) {
    const topCats = breakdown.slice(0, 5).map((c) => `${c.category} (${c.count})`).join(', ')
    parts.push(`Main categories: ${topCats}.`)
  }

  // Quality summary
  const qualityParts: string[] = []
  if (quality.sharp > 0) qualityParts.push(`${quality.sharp} sharp`)
  if (quality.acceptable > 0) qualityParts.push(`${quality.acceptable} acceptable`)
  if (quality.flagged > 0) qualityParts.push(`${quality.flagged} flagged for issues`)
  if (qualityParts.length > 0) {
    parts.push(`Quality: ${qualityParts.join(', ')}.`)
  }

  // Specific quality issues
  const issues: string[] = []
  if (quality.blurry > 0) issues.push(`${quality.blurry} blurry`)
  if (quality.overexposed > 0) issues.push(`${quality.overexposed} overexposed`)
  if (quality.underexposed > 0) issues.push(`${quality.underexposed} underexposed`)
  if (quality.duplicateGroups > 0) issues.push(`${quality.duplicateGroups} duplicate groups`)
  if (issues.length > 0) {
    parts.push(`Issues found: ${issues.join(', ')}.`)
  }

  // Cameras
  if (cameras.length > 0) {
    parts.push(`Shot on ${cameras.join(' and ')}.`)
  }

  return parts.join(' ')
}
