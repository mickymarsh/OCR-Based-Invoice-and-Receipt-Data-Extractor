const { test, expect } = require('@playwright/test');

test('login page works with email/password', async ({ page }) => {
  // Go to login page
  await page.goto('/firebase_login');

  // Check the headline on login page
  const headline = page.locator('h1');
  await expect(headline).toHaveText(/Login to Your Account/);

  // Fill email and password
await page.waitForSelector('input[type="email"]', { state: 'visible' });
await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');

await page.waitForSelector('input[type="password"]', { state: 'visible' });
await page.fill('input[type="password"]', 'Phoenix@25102002');

  // Click login (avoid Google login button)
  const loginButton = page.locator('button', { hasText: /^Login$/ });
  await loginButton.click();

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');

  // Verify that dashboard loaded
  await expect(page).toHaveURL('/dashboard');

  // ✅ Check greeting instead of "Dashboard"
  const dashboardHeader = page.locator('h1');
  await expect(dashboardHeader).toContainText(/Hi/i); // will match "Hi, User!" or "Hi, Madhuni Karunaratne!"
});
