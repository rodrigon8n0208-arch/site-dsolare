import { test, expect } from '@playwright/test';

test('página inicial carrega com título e logo', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle("D'Solare — Energia Solar em Maceió, Alagoas | Análise gratuita");
  await expect(page.locator(`img[alt*="D'Solare"]`).first()).toBeVisible();
});
