import { test, expect } from '@playwright/test';

test.describe('Gemini Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should display Gemini Chat card on homepage', async ({ page }) => {
    await expect(page.locator('text=Gemini Chat')).toBeVisible();
    await expect(page.locator('text=Test Google\'s Gemini AI')).toBeVisible();
    await expect(page.getByTestId('gemini-test-button')).toBeVisible();
  });

  test('should show loading state when test button is clicked', async ({ page }) => {
    await page.getByTestId('gemini-test-button').click();

    // Should show loading state
    await expect(page.getByTestId('gemini-test-button')).toContainText('Testing...');
    await expect(page.getByTestId('gemini-test-button')).toBeDisabled();
  });

  test('should handle Gemini API response', async ({ page }) => {
    // Listen for console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Gemini Response:')) {
        consoleLogs.push(msg.text());
      }
    });

    // Listen for dialog (alert)
    let alertText = '';
    page.on('dialog', async dialog => {
      alertText = dialog.message();
      await dialog.accept();
    });

    await page.getByTestId('gemini-test-button').click();

    // Wait for the request to complete (up to 15 seconds)
    await page.waitForTimeout(15000);

    // Check that either console log or alert appeared
    expect(consoleLogs.length > 0 || alertText.length > 0).toBeTruthy();

    if (alertText) {
      expect(alertText).toMatch(/Gemini says:|Error:/);
    }

    // Button should return to normal state
    await expect(page.getByTestId('gemini-test-button')).toContainText('Test Gemini');
    await expect(page.getByTestId('gemini-test-button')).not.toBeDisabled();
  });
});