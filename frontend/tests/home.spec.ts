import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the application and display header', async ({ page }) => {
    await page.goto('/');

    // Check that header is visible
    await expect(page.locator('header').first()).toBeVisible();

    // Check that we have view mode tabs
    await expect(page.getByText('Graph')).toBeVisible();
    await expect(page.getByText('Split')).toBeVisible();
    await expect(page.getByText('Agent')).toBeVisible();
  });

  test('should display graph visualization by default', async ({ page }) => {
    await page.goto('/');

    // Check that graph container exists
    await expect(page.locator('.graph-container')).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Split view mode', async ({ page }) => {
    await page.goto('/');

    // Click on Split tab
    await page.getByText('Split').click();

    // Check that split view is displayed
    await expect(page.locator('.split-view')).toBeVisible();
    await expect(page.locator('.graph-area')).toBeVisible();
    await expect(page.locator('.chat-area')).toBeVisible();
  });

  test('should switch to Agent view mode', async ({ page }) => {
    await page.goto('/');

    // Click on Agent tab
    await page.getByText('Agent').click();

    // Check that full chat view is displayed
    await expect(page.locator('.full-chat')).toBeVisible();
  });
});
