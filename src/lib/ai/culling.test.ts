import { describe, expect, it } from 'vitest'
import { computeHash } from './culling'

describe('culling engine', () => {
  describe('computeHash', () => {
    it('produces a 64-character binary hash', () => {
      // Create a simple 8x8 test image data
      const data = new Uint8ClampedArray(8 * 8 * 4)
      // Fill with a gradient pattern
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const idx = (y * 8 + x) * 4
          const val = (x + y) * 16
          data[idx] = val     // R
          data[idx + 1] = val // G
          data[idx + 2] = val // B
          data[idx + 3] = 255 // A
        }
      }

      const hash = computeHash(data, 8, 8)
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[01]+$/)
    })

    it('produces same hash for identical images', () => {
      const data1 = new Uint8ClampedArray(8 * 8 * 4)
      const data2 = new Uint8ClampedArray(8 * 8 * 4)

      for (let i = 0; i < data1.length; i += 4) {
        data1[i] = data2[i] = 128
        data1[i + 1] = data2[i + 1] = 128
        data1[i + 2] = data2[i + 2] = 128
        data1[i + 3] = data2[i + 3] = 255
      }

      expect(computeHash(data1, 8, 8)).toBe(computeHash(data2, 8, 8))
    })

    it('produces different hashes for different images', () => {
      const light = new Uint8ClampedArray(8 * 8 * 4)
      const dark = new Uint8ClampedArray(8 * 8 * 4)

      for (let i = 0; i < light.length; i += 4) {
        light[i] = 240; light[i + 1] = 240; light[i + 2] = 240; light[i + 3] = 255
        dark[i] = 10; dark[i + 1] = 10; dark[i + 2] = 10; dark[i + 3] = 255
      }
      // Make one quadrant different in light image
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const idx = (y * 8 + x) * 4
          light[idx] = 0; light[idx + 1] = 0; light[idx + 2] = 0
        }
      }

      const hashLight = computeHash(light, 8, 8)
      const hashDark = computeHash(dark, 8, 8)
      expect(hashLight).not.toBe(hashDark)
    })
  })
})
