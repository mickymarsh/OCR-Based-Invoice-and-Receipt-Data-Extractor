// tests/dashboard.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Dashboard Page', () => {

  test('login and dashboard summary cards work correctly', async ({ page }) => {
    // Step 1: Go to login page
    await page.goto('/firebase_login');

    // Step 2: Fill in email and password
    await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');
    await page.fill('input[type="password"]', 'Phoenix@25102002');

    // Step 3: Click login button
    await page.locator('button', { hasText: /^Login$/ }).click();

    // Step 4: Wait for dashboard URL
    await page.waitForURL('/dashboard');

    // Step 5: Check greeting message
    const greeting = page.locator('h1', { hasText: /^Hi,/ });
    await expect(greeting).toBeVisible();

    // Step 6: Verify current month and expected expenses sections
    await expect(page.locator('h2', { hasText: /Expected Expenses$/ })).toBeVisible();
    // Match the "October Expenses" section specifically
    await expect(page.locator('h2', { hasText: `${new Date().toLocaleString('default', { month: 'long' })} Expenses` })).toBeVisible();

    // Match the "Expected Expenses" section exactly
    await expect(page.locator('h2', { hasText: 'Expected Expenses' })).toBeVisible();

    // Match the "Latest Expenses" section exactly
    await expect(page.locator('h2', { hasText: 'Latest Expenses' })).toBeVisible();


    // Step 7: Summary cards
    const categories = [
      { name: 'Food', selector: '.category-food', icon: '🍔' },
      { name: 'Transport', selector: '.category-transport', icon: '🚗' },
      { name: 'Utilities', selector: '.category-utilities', icon: '⚡' },
      { name: 'Entertainment', selector: '.category-entertainment', icon: '🎬' },
      { name: 'Shopping', selector: '.category-shopping', icon: '🛍️' },
      { name: 'Healthcare', selector: '.category-healthcare', icon: '🏥' },
    ];

    for (const category of categories) {
      const card = page.locator(category.selector);
      await expect(card).toBeVisible();

      // Check category name is visible
      await expect(card.locator('h3', { hasText: category.name })).toBeVisible();

      // Check icon is visible
      await expect(card.locator('span', { hasText: category.icon })).toBeVisible();

      // Click card and verify navigation
      await card.click();
      await page.waitForURL(`**/allExpenses?category=${category.name}`);
      
      // Go back to dashboard for next iteration
      await page.goBack();
    }

    // Step 7: Verify chart component (SVG for Recharts) is visible
    const chart1 = page.getByRole('application');
    await expect(chart1).toBeVisible();


    // Step 8: Verify category buttons exist and can be clicked
    const categoriees = ["All", "Food", "Transport", "Entertainment", "Utilities", "Shopping", "Healthcare"];
    for (const category of categoriees) {
      const btn = page.getByRole('button', { name: category, exact: true });

      await expect(btn).toBeVisible();
      // Optional: Click each to ensure chart updates
      await btn.click();
    }

    // Step 9: Verify time filter buttons exist and can be clicked
    const timeFilters = ["Last Month", "Current Month", "Current Week"];
    for (const time of timeFilters) {
      const btn = page.getByRole('button', { name: time });
      await expect(btn).toBeVisible();
      // Optional: Click each to ensure chart updates
      await btn.click();
    }

    // Step 9: Verify latest expenses table is visible
    const expensesTable = page.locator('table');
    await expect(expensesTable).toBeVisible();

    // Step 10: Verify table header columns
    const headers = ['Date', 'Expense Name', 'Category', 'Amount'];
    for (const header of headers) {
      await expect(page.locator('th', { hasText: header })).toBeVisible();
    }

    // Step 11: Verify at least one row or empty state
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

});
