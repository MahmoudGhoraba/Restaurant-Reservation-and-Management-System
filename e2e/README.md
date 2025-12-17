E2E tests (Playwright)

Prerequisites
- Backend running on port configured in `E2E_API_URL` (default http://localhost:3000)
- Frontend running on port configured in `E2E_BASE_URL` (default http://localhost:3000)

Install Playwright browsers:

```bash
npm run e2e:install
```

Run tests:

```bash
npm run e2e
```

Environment notes
- The backend exposes a seed endpoint `POST /test/seed` which is disabled by default. To enable it set `ENABLE_TEST_ENDPOINTS=true` in the backend environment when starting the server.
- The seed endpoint will create an admin user (`admin@example.com` / `password`) and generate a sample report.
