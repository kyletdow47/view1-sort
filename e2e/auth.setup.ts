/**
 * Auth setup — runs once before all E2E tests.
 *
 * Signs in as the test photographer and saves browser storage state to
 * e2e/.auth/photographer.json so other test files can reuse the session.
 *
 * Credentials come from env vars:
 *   E2E_PHOTOGRAPHER_EMAIL
 *   E2E_PHOTOGRAPHER_PASSWORD
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth', 'photographer.json')

setup('authenticate as photographer', async ({ page }) => {
  const email = process.env.E2E_PHOTOGRAPHER_EMAIL ?? 'test-photographer@view1.test'
  const password = process.env.E2E_PHOTOGRAPHER_PASSWORD ?? 'test-password-123'

  await page.goto('/auth/login')
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect to dashboard or onboarding
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 })

  // Save the authenticated state
  await page.context().storageState({ path: authFile })
})
