import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const apiBase = process.env.E2E_API_URL || 'http://localhost:3000';

test.describe('Admin reports e2e', () => {
  test.beforeEach(async () => {
    // no-op; seeding will be done in the test using Playwright request context
  });

  test('generate report and display it', async ({ page }, testInfo) => {
    const req = await request.newContext({ baseURL: apiBase });

    // seed backend (guarded by ENABLE_TEST_ENDPOINTS=true)
    if (!process.env.E2E_SKIP_SEED) {
      const seedRes = await req.post('/test/seed', { data: { admin: true } });
      let seedBody: any = null;
      try { seedBody = await seedRes.json(); } catch (_) { seedBody = await seedRes.text().catch(() => null); }
      console.log('SEED:', { status: seedRes.status(), ok: seedRes.ok(), body: seedBody });
    } else {
      console.log('E2E_SKIP_SEED=true — skipping backend seeding');
    }

    // Login via API to obtain token and user
    const loginRes = await req.post('/auth/login', { data: { email: 'admin@example.com', password: 'password' } });
    let loginJson: any = null;
    try { loginJson = await loginRes.json(); } catch (_) { loginJson = await loginRes.text().catch(() => null); }
    console.log('LOGIN:', { status: loginRes.status(), ok: loginRes.ok(), body: loginJson });

    const token = loginJson?.token || loginJson?.data?.token;
    const user = loginJson?.user || { email: 'admin@example.com', role: 'admin' };

    // Set token and user in localStorage before navigation
    await page.addInitScript((t, u) => {
      try { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); } catch (e) { /* ignore */ }
    }, token || '', user);

    try {
      await page.goto('/admin/reports');

      await expect(page.getByText('Reports')).toBeVisible();

      await page.getByRole('button', { name: 'Generate Report' }).click();
      await page.locator('input[type=date]').first().fill('2025-11-01');
      await page.locator('input[type=date]').nth(1).fill('2025-11-30');
      await page.getByRole('button', { name: 'Generate' }).click();

      await expect(page.getByText('Sales Report')).toBeVisible({ timeout: 10000 });
    } catch (err) {
      // On failure capture screenshot and page HTML for debugging
      const outDir = path.resolve(process.cwd(), 'e2e-test-artifacts');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
      const name = `${testInfo.title.replace(/\s+/g, '_')}_${Date.now()}`;
      const png = path.join(outDir, `${name}.png`);
      const html = path.join(outDir, `${name}.html`);
      try { await page.screenshot({ path: png, fullPage: true }); console.log('Saved screenshot:', png); } catch (e) { console.warn('Screenshot failed', e); }
      try { const content = await page.content(); fs.writeFileSync(html, content, 'utf8'); console.log('Saved page HTML:', html); } catch (e) { console.warn('Save HTML failed', e); }
      throw err;
    } finally {
      await req.dispose();
    }
  });
});
