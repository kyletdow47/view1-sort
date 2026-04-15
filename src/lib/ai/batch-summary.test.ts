import { describe, it, expect } from 'vitest'
import { generateBatchSummary } from './batch-summary'
import type { PhotoScan } from './batch-scanner'

function makeScan(overrides: Partial<PhotoScan> = {}): PhotoScan {
  return {
    photoId: 'test-1',
    topLabels: [
      { label: 'a close-up portrait photograph of a person looking at the camera', score: 0.9, category: 'portrait' },
    ],
    quality: { sharpness: 100, exposure: 100, flags: [] },
    exif: {
      dateTaken: null, cameraMake: null, cameraModel: null,
      focalLength: null, aperture: null, iso: null, shutterSpeed: null,
      gpsLat: null, gpsLng: null, flash: null,
    },
    duplicateGroupId: null,
    hash: '',
    ...overrides,
  }
}

describe('generateBatchSummary', () => {
  it('returns empty summary for no scans', () => {
    const summary = generateBatchSummary([])
    expect(summary.totalPhotos).toBe(0)
    expect(summary.timespan).toBeNull()
    expect(summary.categoryBreakdown).toEqual([])
    expect(summary.summaryText).toBe('No photos to analyze.')
  })

  it('counts total photos correctly', () => {
    const scans = [makeScan({ photoId: 'a' }), makeScan({ photoId: 'b' }), makeScan({ photoId: 'c' })]
    const summary = generateBatchSummary(scans)
    expect(summary.totalPhotos).toBe(3)
  })

  it('computes category breakdown sorted by count', () => {
    const scans = [
      makeScan({ topLabels: [{ label: 'portrait', score: 0.9, category: 'portrait' }] }),
      makeScan({ topLabels: [{ label: 'portrait', score: 0.8, category: 'portrait' }] }),
      makeScan({ topLabels: [{ label: 'event', score: 0.7, category: 'event' }] }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.categoryBreakdown[0].category).toBe('portrait')
    expect(summary.categoryBreakdown[0].count).toBe(2)
    expect(summary.categoryBreakdown[1].category).toBe('event')
    expect(summary.categoryBreakdown[1].count).toBe(1)
  })

  it('computes timespan from EXIF dates', () => {
    const scans = [
      makeScan({ exif: { ...makeScan().exif, dateTaken: '2026-04-10T10:00:00' } }),
      makeScan({ exif: { ...makeScan().exif, dateTaken: '2026-04-10T16:00:00' } }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.timespan).not.toBeNull()
    expect(summary.timespan!.durationHours).toBe(6)
    expect(summary.timespan!.earliest).toBe('2026-04-10T10:00:00')
    expect(summary.timespan!.latest).toBe('2026-04-10T16:00:00')
  })

  it('returns null timespan when less than 2 dates', () => {
    const scans = [makeScan({ exif: { ...makeScan().exif, dateTaken: '2026-04-10T10:00:00' } })]
    const summary = generateBatchSummary(scans)
    expect(summary.timespan).toBeNull()
  })

  it('counts quality flags correctly', () => {
    const scans = [
      makeScan({ quality: { sharpness: 100, exposure: 100, flags: [] } }),
      makeScan({ quality: { sharpness: 30, exposure: 100, flags: [{ type: 'blurry', confidence: 0.8, details: '' }] } }),
      makeScan({ quality: { sharpness: 100, exposure: 40, flags: [{ type: 'overexposed', confidence: 0.6, details: '' }] } }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.qualityOverview.sharp).toBe(1)
    expect(summary.qualityOverview.blurry).toBe(1)
    expect(summary.qualityOverview.overexposed).toBe(1)
  })

  it('counts duplicate groups', () => {
    const scans = [
      makeScan({ duplicateGroupId: 'dup-1' }),
      makeScan({ duplicateGroupId: 'dup-1' }),
      makeScan({ duplicateGroupId: 'dup-2' }),
      makeScan({ duplicateGroupId: null }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.qualityOverview.duplicateGroups).toBe(2)
  })

  it('detects cameras from EXIF', () => {
    const scans = [
      makeScan({ exif: { ...makeScan().exif, cameraMake: 'Canon', cameraModel: 'Canon EOS R5' } }),
      makeScan({ exif: { ...makeScan().exif, cameraMake: 'Sony', cameraModel: 'ILCE-7M4' } }),
      makeScan({ exif: { ...makeScan().exif, cameraMake: 'Canon', cameraModel: 'Canon EOS R5' } }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.cameras).toHaveLength(2)
    expect(summary.cameras).toContain('Canon EOS R5')
  })

  it('generates a non-empty summaryText', () => {
    const scans = [
      makeScan({ topLabels: [{ label: 'portrait', score: 0.9, category: 'portrait' }] }),
      makeScan({ topLabels: [{ label: 'event', score: 0.8, category: 'event' }] }),
    ]
    const summary = generateBatchSummary(scans)
    expect(summary.summaryText.length).toBeGreaterThan(10)
    expect(summary.summaryText).toContain('2 photos')
  })
})
