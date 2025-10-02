// tests/userProfile.spec.js
const { test, expect } = require('@playwright/test');

test.describe('User Profile Page', () => {
  test('profile loads, fields have values, reset + edit buttons work', async ({ page }) => {
    // 1. Go to the user login page
    await page.goto('/firebase_login');

    // 2. Enter email & password
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');

    await page.waitForSelector('input[type="password"]', { state: 'visible' });
    await page.fill('input[type="password"]', 'Phoenix@25102002');

    const loginButton = page.locator('button', { hasText: /^Login$/ });
    await loginButton.click();

    // 3. Wait for dashboard
    await page.waitForURL('/dashboard');

    // 4. Click the profile icon in the navbar
    await page.click('button:has-text("👤")'); 

    // 5. Click "Your Profile" in dropdown
    await page.click('text=Your Profile');

    // 6. Wait for /profile
    await page.waitForURL('/profile');

    // Ensure main headline is visible
    const headline = page.locator('h1', { hasText: 'User Profile' });
    await expect(headline).toBeVisible();

    // Check key profile fields are not blank (or "Still calculating")
    const fields = ['Full Name', 'Email Address', 'Monthly Salary', 'Yearly Expenses', 'Gender'];
    for (const label of fields) {
      const field = page.locator(`label:text("${label}")`).locator('..').locator('div,input,select');
      await expect(field).toHaveText(/.+|Still calculating/i);
    }

    // Verify Reset Password button is clickable
    const resetButton = page.locator('button', { hasText: /^Reset$/ });
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();

    // Click Reset → wait for status message
    await resetButton.click();

    // More specific locator for password reset status
    const resetStatus = page.locator('div.mt-3', { hasText: /Password reset|Failed/i });
    await expect(resetStatus).toBeVisible();

    // Verify Edit button toggles into Save/Cancel buttons
    const editButton = page.locator('button', { hasText: /^Edit Profile$/ });
    await expect(editButton).toBeVisible();

    // Click Edit → Save + Cancel buttons should appear
    await editButton.click();

    const saveButton = page.locator('button', { hasText: /^Save Changes$/ });
    await expect(saveButton).toBeVisible();

    const cancelButton = page.locator('button', { hasText: /^Cancel$/ });
    await expect(cancelButton).toBeVisible();

    // Cancel → returns back to Edit Profile button
    await cancelButton.click();
    await expect(editButton).toBeVisible();
  });
});
