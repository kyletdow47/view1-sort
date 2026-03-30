/* eslint-disable @typescript-eslint/no-require-imports */
import { defineConfig, devices } from '@playwright/test'

/**
 * View1 Sort — Playwright E2E Configuration
 *
 * Runs against a local dev server (or the BASE_URL env var for staging/CI).
 * Set PLAYWRIGHT_BASE_URL to point tests at a deployed environment.
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel — isolated browser contexts per test */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests twice on CI */
  retries: process.env.CI ? 2 : 0,
  /* Limit parallel workers on CI to avoid resource contention */
  workers: process.env.CI ? 2 : undefined,
  /* HTML report — auto-opens locally, stored as artifact in CI */
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL,
    /* Capture screenshot only on failure */
    screenshot: 'only-on-failure',
    /* Record video on first retry */
    video: 'on-first-retry',
    /* Collect trace on first retry for debugging */
    trace: 'on-first-retry',
    /* Navigation timeout */
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
  },

  projects: [
    /* Setup project — creates a logged-in auth state that other tests reuse */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/photographer.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/photographer.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/photographer.json',
      },
      dependencies: ['setup'],
    },
    /* Client-side tests run without auth (magic link flow) */
    {
      name: 'client-flows',
      testMatch: /e2e\/gallery-client\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Spin up Next.js dev server before tests when not using external BASE_URL */
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
