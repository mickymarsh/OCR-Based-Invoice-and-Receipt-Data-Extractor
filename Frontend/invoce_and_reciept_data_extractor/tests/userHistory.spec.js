// tests/userTransactions.spec.js
const { test, expect } = require('@playwright/test');

test.describe('User History Page', () => {
  test('login, tabs, lists, and pagination work correctly', async ({ page }) => {
    // Step 1: Go to login page
    await page.goto('/firebase_login');

    // Step 2: Fill in email and password
    await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');
    await page.fill('input[type="password"]', 'Phoenix@25102002');

    // Step 3: Click login button
    await page.getByRole('button', { name: /^Login$/ }).click();

    await page.waitForURL('/dashboard');

    // 4. Click the profile icon in the navbar
    await page.click('button:has-text("👤")'); 

    // 5. Click "Your Profile" in dropdown
    await page.click('text=Your History');

    // 6. Wait for /hi
    await page.waitForURL('/hi');


    // Step 5: Check header
    const header = page.getByRole('heading', { name: /Transaction History/i });
    await expect(header).toBeVisible();

    // Step 6: Verify tabs exist
    const tabs = ['All', 'Receipts', 'Invoices'];
    for (const tab of tabs) {
      const tabButton = page.getByRole('button', { name: new RegExp(tab, 'i') });
      await expect(tabButton).toBeVisible();
    }

    // Step 7: Click "Receipts" tab and check list
    await page.getByRole('button', { name: /Receipts/i }).click();

    const receipts= page.locator('h2', { hasText: /Receipts/ });
    await expect(receipts).toBeVisible({ timeout: 10000 });
    await expect(receipts).toBeVisible();

    const receiptItems = page.locator('div', { hasText: /Order:/ });

    const firstReceipt = receiptItems.first();

    // Check edit and delete buttons inside the card
    await expect(firstReceipt.getByText('✏️')).toBeVisible();
    await expect(firstReceipt.getByText('🗑️')).toBeVisible();

    // Step 9: Click "Invoices" tab and check list
    await page.getByRole('button', { name: /Invoices/i }).click();
    const invoiceItems = page.locator('div', { hasText: /Invoice:/ });
    await expect(invoiceItems.first()).toBeVisible();

    // Step 10: Check invoice edit and delete buttons
    const firstInvoice = invoiceItems.first();
    await expect(firstInvoice.getByText('✏️')).toBeVisible();
    await expect(firstInvoice.getByText('🗑️')).toBeVisible();

    // Step 11: Verify pagination exists if more than 1 page
    const pagination = page.locator('div', { hasText: /Page \d+ of \d+/ });
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});
