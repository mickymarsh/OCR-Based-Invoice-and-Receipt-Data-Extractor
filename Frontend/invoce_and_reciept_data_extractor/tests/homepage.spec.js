const { test, expect } = require('@playwright/test');

test('homepage loads and buttons work', async ({ page }) => {
  await page.goto('/');

  // Check headline
  const headline = page.locator('h1');
  await expect(headline).toHaveText(/OCR-Based Receipt & Invoice Scanner/);

  // Check "Get Started" button
  const getStarted = page.locator('a', { hasText: 'Get Started' });
  await expect(getStarted).toBeVisible();

  // Click and check navigation
  await getStarted.click();
  await expect(page).toHaveURL('/firebase_login');

  // Go back to homepage to test the next button
  await page.goto('/');

  // Check "Sign Up" button
  const signUp = page.locator('a', { hasText: 'Sign Up' });
  await expect(signUp).toBeVisible();

  // Click and check navigation
  await signUp.click();
  await expect(page).toHaveURL('/register/signup');
});
