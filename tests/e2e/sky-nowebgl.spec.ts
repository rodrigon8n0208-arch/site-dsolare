import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] } });

test('sem WebGL: foto do hero e texto legíveis', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.hero__photo')).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/no-webgl/);
  await expect(page.locator('.hero__title')).toBeVisible();
});
