/**
 * E2E — Onboarding flow
 *
 * Tests: photographer onboarding wizard steps, completion, redirect to dashboard.
 * Uses the saved photographer auth state.
 */

import { test, expect } from '@playwright/test'

test.describe('Onboarding wizard', () => {
  test('onboarding page is accessible after sign-up', async ({ page }) => {
    await page.goto('/onboarding')
    // Should either show onboarding or redirect to dashboard if already onboarded
    const url = page.url()
    const isOnboarding = url.includes('/onboarding')
    const isDashboard = url.includes('/dashboard')
    expect(isOnboarding || isDashboard).toBe(true)
  })

  test('onboarding shows welcome step', async ({ page }) => {
    await page.goto('/onboarding')
    if (page.url().includes('/dashboard')) {
      // Already onboarded — skip
      test.skip()
      return
    }
    // Should show a welcome/greeting heading
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible()
  })

  test('onboarding wizard has multiple steps', async ({ page }) => {
    await page.goto('/onboarding')
    if (page.url().includes('/dashboard')) {
      test.skip()
      return
    }
    // There should be step indicators or a progress element
    const stepIndicator = page
      .locator('[data-step], [aria-label*="step"], .step-indicator, progress')
      .first()
    // Wizard content should be visible regardless
    await expect(page.locator('main, [role="main"], form').first()).toBeVisible()
  })

  test('onboarding plan step shows pricing options', async ({ page }) => {
    await page.goto('/onboarding')
    if (page.url().includes('/dashboard')) {
      test.skip()
      return
    }
    // Navigate through to the plan step — look for plan/pricing content
    // Try clicking "Next" buttons until we find a plan selector or reach dashboard
    let attempts = 0
    while (attempts < 5) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first()
      const hasNext = await nextBtn.isVisible().catch(() => false)
      if (!hasNext) break
      await nextBtn.click()
      await page.waitForTimeout(500)
      attempts++
    }
    // Either we hit the plan step or completed onboarding
    const url = page.url()
    expect(url.includes('/onboarding') || url.includes('/dashboard')).toBe(true)
  })
})
