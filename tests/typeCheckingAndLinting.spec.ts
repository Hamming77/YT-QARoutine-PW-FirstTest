import { test, expect } from '@playwright/test';

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


test('incorrect promise usage', async ({ page }) => {
    await page.goto('https://playwright.dev/');
  
    // Use await when it is not necessary in a synchronous method like getByRole. No need to await a locator!
    const button = page.getByRole('link', { name: 'Get started' })
    await button.click();
      
    // Missing await when performing an action or an assertion
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
