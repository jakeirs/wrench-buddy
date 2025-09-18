import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Check that the page loads without errors
  await expect(page).toHaveURL('/');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Basic accessibility check - ensure page has the correct title
  await expect(page).toHaveTitle(/wrench buddy/i);

  // Check that the main heading is visible
  await expect(page.locator('h1')).toContainText('Wrench Buddy');

  // Check that the subtitle is visible
  await expect(page.locator('text=AI-Powered Image Editor')).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({
    path: 'tests/screenshots/homepage.png',
    fullPage: true
  });
});

test('navigation and basic functionality', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Check that the Library card title is visible (it's likely an h2 or div)
  await expect(page.getByText('Library', { exact: true }).first()).toBeVisible();

  // Check that the "View Library" button is visible
  const viewLibraryButton = page.getByRole('button', { name: 'View Library' });
  await expect(viewLibraryButton).toBeVisible();

  // Test navigation to library page by clicking the link (the entire card is a link)
  await page.getByRole('link').first().click();

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');

  // Check that we navigated to the library page
  await expect(page).toHaveURL('/library');

  // Take a screenshot after navigation
  await page.screenshot({
    path: 'tests/screenshots/library-page.png',
    fullPage: true
  });
});