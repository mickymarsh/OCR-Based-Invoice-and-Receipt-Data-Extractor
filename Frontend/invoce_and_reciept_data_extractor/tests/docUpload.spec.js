// tests/docUpload.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Document Upload Page', () => {

  test('page loads and buttons are clickable', async ({ page }) => {
    // Go to the doc upload page
    await page.goto('/doc_upload');

    // Check the header
    const header = page.getByRole('heading', { name: /Upload Documents/i });
    await expect(header).toBeVisible();

    // Check "Select Files" label (clickable)
    const selectFilesLabel = page.locator('label[for="file-upload"]');
    await expect(selectFilesLabel).toBeVisible();
    await selectFilesLabel.click();

    // Check "Upload and Extract" button (may be disabled initially)
    const uploadButton = page.getByRole('button', { name: /Upload and Extract/i });
    await expect(uploadButton).toBeVisible();

    // Check drag & drop area text

 
    const dragDropText = page.locator('div.font-bold', { hasText: 'Drag & Drop files here' });
    await expect(dragDropText).toBeVisible();
    
    const previewPlaceholder = page.locator('div', { hasText: 'No preview available' }).first();
    await expect(previewPlaceholder).toBeVisible();

    
    
  });

});
