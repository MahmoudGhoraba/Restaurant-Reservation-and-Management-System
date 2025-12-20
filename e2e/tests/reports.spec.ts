import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const apiBase = process.env.E2E_API_URL || 'http://localhost:3000';
const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3001';

test.describe('Admin reports e2e', () => {
  test.beforeEach(async () => {
    // no-op; seeding will be done in the test using Playwright request context
  });

  test('generate report and display it', async ({ page }, testInfo) => {
    const req = await request.newContext({ baseURL: apiBase });



    await page.goto(`${FRONTEND}/login`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('textbox').nth(0).fill('admin@example.com');
    await page.getByRole('textbox').nth(1).fill('password');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Reports', exact: true }).click();

    await page.getByRole('button', { name: 'Generate Report' }).click();
    await page.locator('input[type=date]').first().fill('2025-11-01');
    await page.locator('input[type=date]').nth(1).fill('2025-11-30');
    await page.getByRole('button', { name: 'Generate' }).nth(1).click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Sales Report' }).first()).toBeVisible();
  });
});
