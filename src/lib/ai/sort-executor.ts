/**
 * Sort plan executor.
 *
 * Takes Claude's sorting plan (from Brain 2) and the per-photo scan results
 * (from Brain 1) and assigns each photo to a category with a rank.
 *
 * This is the bridge that turns AI output into concrete database updates.
 */

import type { PhotoScan } from './batch-scanner'

export interface SortPlanCategory {
  name: string
  description: string
  matchLabels: string[]
  priority: number
}

export interface SortPlan {
  categories: SortPlanCategory[]
  qualityThreshold: number
  rejectCriteria: string[]
  sortWithinCategory: 'quality_desc' | 'chronological' | 'quality_asc'
}

export interface SortedPhoto {
  photoId: string
  category: string
  categoryPriority: number
  rankInCategory: number
  confidence: number
  rejected: boolean
  rejectReason?: string
  topLabel: string
}

/**
 * Execute a sorting plan against scan results.
 *
 * For each photo:
 * 1. Check reject criteria (blurry, duplicates, etc.)
 * 2. Match against each category's matchLabels
 * 3. Assign to the best-matching category
 * 4. Rank within category by quality or chronologically
 */
export function executeSortPlan(
  plan: SortPlan,
  scans: PhotoScan[]
): SortedPhoto[] {
  const categoryBuckets = new Map<string, Array<{ scan: PhotoScan; matchScore: number }>>()

  // Initialize buckets
  for (const cat of plan.categories) {
    categoryBuckets.set(cat.name, [])
  }
  categoryBuckets.set('Unsorted', [])

  const results: SortedPhoto[] = []

  for (const scan of scans) {
    // Check reject criteria
    const rejectReason = checkRejectCriteria(scan, plan.rejectCriteria, plan.qualityThreshold)
    if (rejectReason) {
      results.push({
        photoId: scan.photoId,
        category: 'Rejected',
        categoryPriority: 999,
        rankInCategory: 0,
        confidence: 0,
        rejected: true,
        rejectReason,
        topLabel: scan.topLabels[0]?.label ?? '',
      })
      continue
    }

    // Find best matching category
    const match = findBestCategory(scan, plan.categories)
    const bucket = categoryBuckets.get(match.categoryName) ?? categoryBuckets.get('Unsorted')!
    bucket.push({ scan, matchScore: match.score })
  }

  // Sort within each category and assign ranks
  for (const cat of plan.categories) {
    const bucket = categoryBuckets.get(cat.name) ?? []
    sortBucket(bucket, plan.sortWithinCategory)

    bucket.forEach((item, index) => {
      results.push({
        photoId: item.scan.photoId,
        category: cat.name,
        categoryPriority: cat.priority,
        rankInCategory: index + 1,
        confidence: item.matchScore,
        rejected: false,
        topLabel: item.scan.topLabels[0]?.label ?? '',
      })
    })
  }

  // Handle unsorted
  const unsorted = categoryBuckets.get('Unsorted') ?? []
  unsorted.forEach((item, index) => {
    results.push({
      photoId: item.scan.photoId,
      category: 'Unsorted',
      categoryPriority: 998,
      rankInCategory: index + 1,
      confidence: item.matchScore,
      rejected: false,
      topLabel: item.scan.topLabels[0]?.label ?? '',
    })
  })

  return results
}

function checkRejectCriteria(
  scan: PhotoScan,
  criteria: string[],
  qualityThreshold: number
): string | null {
  for (const criterion of criteria) {
    const lower = criterion.toLowerCase()

    if (lower === 'blurry' && scan.quality.flags.some((f) => f.type === 'blurry' && f.confidence > qualityThreshold)) {
      return 'blurry'
    }
    if (lower === 'duplicate' && scan.duplicateGroupId !== null) {
      return 'duplicate'
    }
    if (lower === 'overexposed' && scan.quality.flags.some((f) => f.type === 'overexposed' && f.confidence > qualityThreshold)) {
      return 'overexposed'
    }
    if (lower === 'underexposed' && scan.quality.flags.some((f) => f.type === 'underexposed' && f.confidence > qualityThreshold)) {
      return 'underexposed'
    }
  }

  return null
}

interface CategoryMatch {
  categoryName: string
  score: number
}

function findBestCategory(
  scan: PhotoScan,
  categories: SortPlanCategory[]
): CategoryMatch {
  let bestMatch: CategoryMatch = { categoryName: 'Unsorted', score: 0 }

  for (const cat of categories) {
    const score = computeCategoryMatchScore(scan, cat)
    if (score > bestMatch.score) {
      bestMatch = { categoryName: cat.name, score }
    }
  }

  return bestMatch
}

/**
 * Compute how well a photo matches a category.
 *
 * Uses fuzzy string matching between the photo's top classification labels
 * and the category's matchLabels. This handles the fact that Brain 1's
 * labels and Brain 2's matchLabels won't be exact matches.
 */
function computeCategoryMatchScore(
  scan: PhotoScan,
  category: SortPlanCategory
): number {
  let bestScore = 0

  for (const scanLabel of scan.topLabels) {
    for (const matchLabel of category.matchLabels) {
      const similarity = computeLabelSimilarity(scanLabel.label, matchLabel)
      // Weight by the classification confidence
      const weighted = similarity * scanLabel.score
      if (weighted > bestScore) {
        bestScore = weighted
      }
    }
  }

  return bestScore
}

/**
 * Compute similarity between two label strings.
 * Uses word overlap (Jaccard-like) since both labels are descriptive sentences.
 */
function computeLabelSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeLabel(a))
  const wordsB = new Set(normalizeLabel(b))

  if (wordsA.size === 0 || wordsB.size === 0) return 0

  let intersection = 0
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++
  }

  const union = new Set([...wordsA, ...wordsB]).size
  return union > 0 ? intersection / union : 0
}

function sortBucket(
  bucket: Array<{ scan: PhotoScan; matchScore: number }>,
  sortMode: SortPlan['sortWithinCategory']
): void {
  bucket.sort((a, b) => {
    switch (sortMode) {
      case 'quality_desc':
        return b.matchScore - a.matchScore
      case 'quality_asc':
        return a.matchScore - b.matchScore
      case 'chronological': {
        const dateA = a.scan.exif.dateTaken ?? ''
        const dateB = b.scan.exif.dateTaken ?? ''
        return dateA.localeCompare(dateB)
      }
      default:
        return b.matchScore - a.matchScore
    }
  })
}

const STOP_WORDS = new Set(['a', 'an', 'the', 'of', 'for', 'in', 'at', 'on', 'with', 'and', 'or', 'is', 'to'])

function normalizeLabel(label: string): string[] {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
}
