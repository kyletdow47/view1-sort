/**
 * E2E — Auth flows
 *
 * Tests: sign up, login, logout, password reset.
 * These run WITHOUT the saved auth state (fresh browser context).
 */

import { test, expect } from '@playwright/test'

// Override storageState for unauthenticated tests
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Sign-up flow', () => {
  test('landing page has sign-up CTA', async ({ page }) => {
    await page.goto('/')
    // The landing page should have a waitlist or sign-up CTA
    const cta = page.getByRole('link', { name: /get (early access|started|waitlist)/i }).first()
    await expect(cta).toBeVisible()
  })

  test('sign-up page renders correctly', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /create (your )?account/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible()
  })

  test('sign-up shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    // Browser native validation or custom error should prevent submission
    // Check that we haven't navigated away
    await expect(page).toHaveURL(/\/auth\/signup/)
  })

  test('sign-up shows error for invalid email', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    // Stay on page — either browser validation or custom error
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})

test.describe('Login flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Should show an error message
    const errorEl = page.locator('[role="alert"], .text-red-400, [data-testid="error"]').first()
    await expect(errorEl).toBeVisible({ timeout: 5_000 })
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test('has link to sign-up from login page', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('link', { name: /sign up|create account/i })).toBeVisible()
  })
})

test.describe('Authenticated navigation', () => {
  // These run WITH saved auth state
  test.use({ storageState: 'e2e/.auth/photographer.json' })

  test('redirects to dashboard when already logged in', async ({ page }) => {
    await page.goto('/auth/login')
    // Should be redirected away from login
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10_000 })
  })

  test('dashboard is accessible when logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).not.toHaveURL(/\/auth\/login/)
  })
})
