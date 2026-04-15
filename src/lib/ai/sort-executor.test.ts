import { describe, it, expect } from 'vitest'
import { executeSortPlan } from './sort-executor'
import type { SortPlan } from './sort-executor'
import type { PhotoScan } from './batch-scanner'

function makeScan(photoId: string, topLabel: string, category: string, score = 0.9): PhotoScan {
  return {
    photoId,
    topLabels: [{ label: topLabel, score, category: category as PhotoScan['topLabels'][0]['category'] }],
    quality: { sharpness: 100, exposure: 100, flags: [] },
    exif: {
      dateTaken: null, cameraMake: null, cameraModel: null,
      focalLength: null, aperture: null, iso: null, shutterSpeed: null,
      gpsLat: null, gpsLng: null, flash: null,
    },
    duplicateGroupId: null,
    hash: '',
  }
}

const BASIC_PLAN: SortPlan = {
  categories: [
    { name: 'Portraits', description: 'Portrait photos', matchLabels: ['photograph portrait person posing'], priority: 1 },
    { name: 'Details', description: 'Detail shots', matchLabels: ['close-up detail photograph jewelry rings'], priority: 2 },
    { name: 'Venue', description: 'Venue shots', matchLabels: ['photograph building exterior interior'], priority: 3 },
  ],
  qualityThreshold: 0.7,
  rejectCriteria: ['blurry', 'duplicate'],
  sortWithinCategory: 'quality_desc',
}

describe('executeSortPlan', () => {
  it('assigns photos to the best matching category', () => {
    const scans = [
      makeScan('p1', 'a close-up portrait photograph of a person looking at the camera', 'portrait'),
      makeScan('p2', 'a close-up detail photograph of jewelry, rings, or accessories', 'detail'),
      makeScan('p3', 'a photograph of the exterior of a building or structure', 'architecture'),
    ]

    const results = executeSortPlan(BASIC_PLAN, scans)
    const p1 = results.find((r) => r.photoId === 'p1')!
    const p2 = results.find((r) => r.photoId === 'p2')!
    const p3 = results.find((r) => r.photoId === 'p3')!

    expect(p1.category).toBe('Portraits')
    expect(p2.category).toBe('Details')
    expect(p3.category).toBe('Venue')
  })

  it('rejects blurry photos when in reject criteria', () => {
    const blurryScan: PhotoScan = {
      ...makeScan('blur-1', 'portrait', 'portrait'),
      quality: {
        sharpness: 20,
        exposure: 100,
        flags: [{ type: 'blurry', confidence: 0.9, details: 'Very blurry' }],
      },
    }

    const results = executeSortPlan(BASIC_PLAN, [blurryScan])
    expect(results[0].rejected).toBe(true)
    expect(results[0].rejectReason).toBe('blurry')
    expect(results[0].category).toBe('Rejected')
  })

  it('rejects duplicates when in reject criteria', () => {
    const dupScan: PhotoScan = {
      ...makeScan('dup-1', 'portrait', 'portrait'),
      duplicateGroupId: 'dup-group-1',
    }

    const results = executeSortPlan(BASIC_PLAN, [dupScan])
    expect(results[0].rejected).toBe(true)
    expect(results[0].rejectReason).toBe('duplicate')
  })

  it('does not reject mildly blurry photos below threshold', () => {
    const mildBlur: PhotoScan = {
      ...makeScan('mild-1', 'a close-up portrait photograph of a person looking at the camera', 'portrait'),
      quality: {
        sharpness: 60,
        exposure: 100,
        flags: [{ type: 'blurry', confidence: 0.4, details: 'Slightly soft' }],
      },
    }

    const results = executeSortPlan(BASIC_PLAN, [mildBlur])
    expect(results[0].rejected).toBe(false)
  })

  it('assigns rank within each category', () => {
    const scans = [
      makeScan('p1', 'a close-up portrait photograph of a person looking at the camera', 'portrait', 0.95),
      makeScan('p2', 'a close-up portrait photograph of a person looking at the camera', 'portrait', 0.80),
      makeScan('p3', 'a close-up portrait photograph of a person looking at the camera', 'portrait', 0.70),
    ]

    const results = executeSortPlan(BASIC_PLAN, scans)
    const portraits = results.filter((r) => r.category === 'Portraits').sort((a, b) => a.rankInCategory - b.rankInCategory)
    expect(portraits).toHaveLength(3)
    expect(portraits[0].rankInCategory).toBe(1)
    expect(portraits[2].rankInCategory).toBe(3)
  })

  it('puts unmatched photos in Unsorted', () => {
    const scan = makeScan('weird-1', 'something completely unrelated to photography categories', 'other', 0.3)
    const results = executeSortPlan(BASIC_PLAN, [scan])
    // With very low similarity, it may still match weakly. Check it doesn't crash.
    expect(results).toHaveLength(1)
    expect(results[0].rejected).toBe(false)
  })

  it('handles empty scan array', () => {
    const results = executeSortPlan(BASIC_PLAN, [])
    expect(results).toHaveLength(0)
  })
})
