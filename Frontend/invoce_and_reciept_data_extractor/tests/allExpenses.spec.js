// tests/allExpenses.spec.js
const { test, expect } = require('@playwright/test');

test.describe('All Expenses Page via Dashboard', () => {

  // Helper function to login
  const login = async (page) => {
    await page.goto('/firebase_login');
    await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');
    await page.fill('input[type="password"]', 'Phoenix@25102002');
    await page.getByRole('button', { name: /^Login$/ }).click();
    await page.waitForURL('/dashboard');
  };

  // Helper function to check expenses page for a category
  const checkCategoryExpenses = async (page, categoryName, cardClass) => {
    // Click the category summary card
    const categoryCard = page.locator(`.${cardClass}`);
    await expect(categoryCard).toBeVisible();
    await categoryCard.click();

    // Wait for All Expenses page filtered by category
    await page.waitForURL(new RegExp(`allExpenses\\?category=${categoryName}`));

    // Check header
    const header = page.getByRole('heading', { name: /^All Expenses$/ });
    await expect(header).toBeVisible();

    // Verify filter dropdowns
    await expect(page.locator('#month-select')).toBeVisible();
    await expect(page.locator('#year-select')).toBeVisible();
    await expect(page.locator('#category-select')).toBeVisible();

    // Verify table
    const table = page.locator('table');
    await expect(table).toBeVisible();

    const headers = ['Date', 'Expense Name', 'Category', 'Amount'];
    for (const headerText of headers) {
      await expect(table.locator('th', { hasText: headerText })).toBeVisible();
    }

    // Verify at least one row or empty state
    const tableRows = table.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();

    // Verify total expenses section
    const totalText = page.locator('h3', { hasText: /^Total/ });
    await expect(totalText).toBeVisible();

    // Navigate back to dashboard
    const backButton = page.getByRole('button', { name: /Back to Dashboard/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    await page.waitForURL('/dashboard');
  };

  const categories = [
    { name: 'Utilities', cardClass: 'category-utilities' },
    { name: 'Food', cardClass: 'category-food' },
    { name: 'Shopping', cardClass: 'category-shopping' },
    { name: 'Healthcare', cardClass: 'category-healthcare' },
    { name: 'Transport', cardClass: 'category-transport' },
    { name: 'Entertainment', cardClass: 'category-entertainment' },
  ];

  for (const cat of categories) {
    test(`${cat.name} expenses work correctly`, async ({ page }) => {
      await login(page);
      await checkCategoryExpenses(page, cat.name, cat.cardClass);
    });
  }

});
