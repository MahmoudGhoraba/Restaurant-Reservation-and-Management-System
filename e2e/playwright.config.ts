import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  // Ignore other test files in the repo (Jest unit tests, frontend tests, etc.)
  testIgnore: [
    '../**/src/**/*.spec.ts',
    '../**/*.spec.ts',
    '../frontend/**',
    '../backend/**',
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_FRONTEND_URL || 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
