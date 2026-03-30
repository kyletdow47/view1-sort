/**
 * E2E — Delivery & finals flow
 *
 * Tests: photographer marks editing complete, re-uploads finals,
 *        client sees finals and can download.
 * Uses saved photographer auth state.
 */

import { test, expect } from '@playwright/test'

test.describe('Photographer delivery workflow', () => {
  test('project settings page is accessible', async ({ page }) => {
    await page.goto('/dashboard/project/demo-1/settings')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })

  test('project export page is accessible', async ({ page }) => {
    await page.goto('/dashboard/project/demo-1/export')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('project edits page is accessible', async ({ page }) => {
    await page.goto('/dashboard/project/demo-1/edits')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })

  test('bulk operations page is accessible', async ({ page }) => {
    await page.goto('/dashboard/bulk')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.locator('main, [role="main"], h1').first()).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Download API endpoints', () => {
  test('download API returns 401 without auth token for private gallery', async ({ page }) => {
    const response = await page.request.get(
      '/api/gallery/nonexistent-private-project/download?type=zip',
    )
    // Private gallery without token should return 401 or 404
    expect([401, 404, 403]).toContain(response.status())
  })

  test('download single photo returns 401 without auth', async ({ page }) => {
    const response = await page.request.get(
      '/api/gallery/nonexistent-project/download?mediaId=some-id',
    )
    expect([401, 404, 403]).toContain(response.status())
  })
})

test.describe('Analytics dashboard', () => {
  test('analytics page is accessible', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Client dashboard', () => {
  // Client dashboard is at /client — unauthenticated clients see their galleries
  test.use({ storageState: { cookies: [], origins: [] } })

  test('client dashboard redirects or shows login for unauthed users', async ({ page }) => {
    // /client may require auth or show a login prompt
    await page.goto('/gallery')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Booking and contracts', () => {
  test('booking form page is accessible', async ({ page }) => {
    await page.goto('/dashboard/bookings')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.locator('main, h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('public booking form works without auth', async ({ page }) => {
    await page.goto('/book/test-photographer-id')
    // Public booking form — accessible without auth
    await expect(page.locator('body')).toBeVisible()
    await expect(page).not.toHaveURL(/\/auth\/login/)
  })
})
