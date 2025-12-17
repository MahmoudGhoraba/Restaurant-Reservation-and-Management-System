import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL || 'http://localhost:3001';

test.describe('Customer end-to-end flow', () => {
  test('register -> login -> reserve -> dine-in order', async ({ request }) => {
    // 1) Seed admin (enable ENABLE_TEST_ENDPOINTS=true on backend)
    if (!process.env.E2E_SKIP_SEED) {
      const seedRes = await request.post(`${API}/test/seed`, { data: { admin: true } });
      const seedJson = await seedRes.json().catch(() => ({}));
      expect(seedRes.ok() || seedJson.status === 'ok').toBeTruthy();
    } else {
      console.log('E2E_SKIP_SEED=true — skipping backend seeding');
    }

    // 2) Register a new customer
    const customerEmail = `e2e.customer+${Date.now()}@example.com`;
    const registerRes = await request.post(`${API}/auth/register`, {
      data: { name: 'E2E Customer', email: customerEmail, password: 'password' },
    });
    expect(registerRes.ok()).toBeTruthy();
    const registerJson = await registerRes.json();
    expect(registerJson).toHaveProperty('user');

    // 3) Login as the customer
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: customerEmail, password: 'password' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { user: customerUser, token: customerToken } = await loginRes.json();
    expect(customerUser).toBeTruthy();
    expect(customerToken).toBeTruthy();

    // 4) Login as admin (seed may not create admin correctly). If login fails,
    // try to register the admin with the correct role and login again.
    let adminLogin = await request.post(`${API}/auth/login`, {
      data: { email: 'admin@example.com', password: 'password' },
    });
    if (!adminLogin.ok()) {
      await request.post(`${API}/auth/register`, {
        data: { name: 'E2E Admin', email: 'admin@example.com', password: 'password', role: 'Admin' },
      }).catch(() => null);
      adminLogin = await request.post(`${API}/auth/login`, {
        data: { email: 'admin@example.com', password: 'password' },
      });
    }
    expect(adminLogin.ok()).toBeTruthy();
    const adminJson = await adminLogin.json();
    const adminToken = adminJson?.token;
    expect(adminToken).toBeTruthy();

    // 5) Create a table as admin
    const tableRes = await request.post(`${API}/tables`, {
      data: { capacity: 4, location: 'Patio' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(tableRes.ok()).toBeTruthy();
    const tableJson = await tableRes.json();
    const tableId = tableJson?.data?._id || tableJson?.data?.id || tableJson?.data;
    expect(tableId).toBeTruthy();

    // 6) Create a menu item as admin
    const menuRes = await request.post(`${API}/menuitems`, {
      data: {
        name: 'E2E Burger',
        description: 'Test burger',
        price: 9.99,
        availability: true,
        category: 'Mains',
      },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(menuRes.ok()).toBeTruthy();
    const menuJson = await menuRes.json();
    const menuItemId = menuJson?.data?._id || menuJson?.data?.id || menuJson?.data;
    expect(menuItemId).toBeTruthy();

    // 7) Create a reservation as the customer (requires JWT auth)
    const reservationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // tomorrow
    const reserveRes = await request.post(`${API}/reservations`, {
      data: {
        table: tableId,
        reservationDate: reservationDate,
        reservationTime: '19:00',
        numberOfGuests: 2,
      },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(reserveRes.ok()).toBeTruthy();
    const reserveJson = await reserveRes.json();
    const reservationId = reserveJson?.data?._id || reserveJson?.data?.id || reserveJson?.data;
    expect(reservationId).toBeTruthy();

    // 8) Place a DineIn order referencing the reservation
    const orderRes = await request.post(`${API}/orders`, {
      data: {
        id: customerUser._id || customerUser.id || customerUser._id || customerUser,
        items: [{ menuItem: menuItemId, quantity: 1 }],
        orderType: 'DineIn',
        paymentType: 'Cash',
        reservationId,
      },
    });
    expect(orderRes.ok()).toBeTruthy();
    const orderJson = await orderRes.json();
    expect(orderJson.status === 'success' || orderJson?.data).toBeTruthy();
  });
});
