// tests/chatbot.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Chatbot Page', () => {

  test('renders welcome message, accepts input, and suggestions work', async ({ page }) => {
    // Go to chatbot page
    await page.goto('/firebase_login');

    // Step 2: Fill in email and password
    await page.fill('input[type="email"]', 'madunikarunarathne@yahoo.com');
    await page.fill('input[type="password"]', 'Phoenix@25102002');

    // Step 3: Click login button
    await page.getByRole('button', { name: /^Login$/ }).click();

    await page.waitForURL('/dashboard');

    await page.click('text=AI Assistant');
    await page.waitForURL('/chatbot')

    // Check for main heading
    const heading = page.getByRole('heading', { name: /Expense Assistant/i });
    await expect(heading).toBeVisible();

    // Check for welcome message
    const welcomeText = page.locator('p', { hasText: /Hi there! I'm your expense assistant/i });
    await expect(welcomeText).toBeVisible();

    // Check for suggestion buttons
    const suggestionButton = page.getByRole('button', { name: /How much did I spend on food this month\?/i });
    await expect(suggestionButton).toBeVisible();

    // Click a suggestion and check input value is updated
    await suggestionButton.click();
    const input = page.locator('input[placeholder*="Ask about your expenses"]');
    await expect(input).toHaveValue('How much did I spend on food this month?');

    // Type a custom question
    await input.fill('Show my transport expenses in July');
    await expect(input).toHaveValue('Show my transport expenses in July');

    // Submit the question
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Expect loading indicator to appear
    const loading = page.locator('span', { hasText: /Thinking/i });
    await expect(loading).toBeVisible();

    // Wait for response message (example: could be "answer" object)
    const responseBubble = page.locator('div', { hasText: /How much did I spend/i }).last();
    await expect(responseBubble).toBeVisible();
  });

});
