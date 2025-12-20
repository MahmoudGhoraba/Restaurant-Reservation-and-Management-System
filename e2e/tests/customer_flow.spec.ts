import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL || 'http://localhost:3001';
const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3001';

test.describe('Customer end-to-end flow', () => {
  test('register -> login -> reserve -> dine-in order', async ({ request, page }) => {
    // 1) Seed admin (enable ENABLE_TEST_ENDPOINTS=true on backend)
    // if (!process.env.E2E_SKIP_SEED) {
    //   const seedRes = await request.post(`${API}/test/seed`, { data: { admin: true } });
    //   const seedJson = await seedRes.json().catch(() => ({}));
    //   expect(seedRes.ok() || seedJson.status === 'ok').toBeTruthy();
    // } else {
    //   console.log('E2E_SKIP_SEED=true — skipping backend seeding');
    // }

    // 2) Register a new customer via the frontend UI
    const customerEmail = `e2e.customer+${Date.now()}@example.com`;
    await page.goto(`${FRONTEND}/register`);
    await page.getByRole('textbox').nth(0).fill('E2E Customer');
    await page.getByRole('textbox').nth(1).fill(customerEmail);
    await page.getByRole('textbox').nth(2).fill('password');
    await page.getByRole('textbox').nth(3).fill('password');

    const [registerResponse] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/auth/register') && resp.status() < 500),
      page.getByRole('button', { name: 'Register' }).click(),
    ]);
    expect(registerResponse.ok()).toBeTruthy();
    const registerJson = await registerResponse.json();
    expect(registerJson).toHaveProperty('user');
    const customerUser = registerJson.user;

    // 3) Login as the customer via frontend UI
    await page.goto(`${FRONTEND}/login`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox').nth(0).fill(customerEmail);
    await page.getByRole('textbox').nth(1).fill('password');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByRole('heading', { name: 'Welcome to Mama Mama' })
    ).toBeVisible();

    await page.getByText("Logout").click();
    // 4) Login as admin via frontend UI
    await page.goto(`${FRONTEND}/login`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('textbox').nth(0).fill('admin@example.com');
    await page.getByRole('textbox').nth(1).fill('password');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Sign in' }).click();
    expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();


    // 5) Create a table as admin
    await page.getByRole('link', { name: 'Tables' }).nth(0).click();
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('4');
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('patio');
    const [createTableResponse] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/tables') &&
          resp.request().method() === 'POST'
      ),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);

    expect(createTableResponse.status()).toBe(201);
    const tableJson = await createTableResponse.json();
    const tableId = tableJson._id || tableJson.id || tableJson.data?._id || tableJson.data?.id;

    // 6) Create a menu item as admin
    await page.getByRole('navigation').getByRole('link', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Add Menu Item' }).click();
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().fill('salmon');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('Mains');
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('12');
    await page.locator('input[type="url"]').click();
    await page.locator('textarea').click();
    await page.locator('textarea').click();
    await page.locator('textarea').fill('test');
    const [createMenuItemResponse] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/menuitems') &&
          resp.request().method() === 'POST'
      ),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);

    expect(createMenuItemResponse.status()).toBe(201);
    const menuItemJson = await createMenuItemResponse.json();
    const menuItemId = menuItemJson._id || menuItemJson.id || menuItemJson.data?._id || menuItemJson.data?.id;

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox').nth(0).fill(customerEmail);
    await page.getByRole('textbox').nth(1).fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByRole('heading', { name: 'Welcome to Mama Mama' })
    ).toBeVisible();


    await page.getByRole('navigation').getByRole('link', { name: 'Reservations' }).click();
    await page.getByRole('button', { name: 'New Reservation' }).click();
    await page.getByRole('combobox').selectOption('692c47f3bacc390f0f2b7c59');
    await page.locator('input[type="date"]').fill('2025-12-24');
    await page.locator('input[type="time"]').click();
    await page.locator('input[type="time"]').fill('11:11');
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('3');
    await page.getByRole('spinbutton').nth(1).click();
    await page.locator('textarea').click();
    await page.locator('textarea').fill('none');
    const [createReservationResponse] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/reservations') &&
          resp.request().method() === 'POST'
      ),
      page.getByRole('button', { name: 'Create Reservation' }).click(),
    ]);

    expect(createReservationResponse.status()).toBe(201);
    await page.getByRole('navigation').getByRole('link', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'My Orders' }).click();
    await page.getByRole('button', { name: 'Place New Order' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('button', { name: 'Cart (1) $' }).click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();

  });
});
