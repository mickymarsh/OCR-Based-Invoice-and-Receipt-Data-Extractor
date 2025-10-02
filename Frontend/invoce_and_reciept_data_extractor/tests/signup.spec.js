// tests/signup.spec.js
const { test, expect } = require('@playwright/test');

test('signup page loads and email form works', async ({ page }) => {
  await page.goto('/register/signup');

  // Check header
  const headline = page.locator('h1');
  await expect(headline).toHaveText(/Create Your Account/);

  // Initial options
  const emailOption = page.locator('button', { hasText: 'Sign Up with Email' });
  const googleOption = page.locator('button', { hasText: 'Sign Up with Google' });
  await expect(emailOption).toBeVisible();
  await expect(googleOption).toBeVisible();

  // Click "Sign Up with Email" to show form
  await emailOption.click();

  // Check form inputs
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[placeholder="Create a password"]');
  const confirmPasswordInput = page.locator('input[placeholder="Re-enter your password"]');
  const createAccountBtn = page.locator('button', { hasText: 'Create Account' });
  const backBtn = page.locator('button', { hasText: 'Back to Options' });

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(confirmPasswordInput).toBeVisible();
  await expect(createAccountBtn).toBeVisible();
  await expect(backBtn).toBeVisible();

  // Test "Back to Options" button
  await backBtn.click();
  await expect(emailOption).toBeVisible(); // initial options visible again
});
