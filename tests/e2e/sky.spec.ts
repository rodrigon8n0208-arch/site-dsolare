import { test, expect } from '@playwright/test';

test('com WebGL o céu monta um canvas com nível de qualidade', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas#sky');
  await expect(canvas).toHaveCount(1, { timeout: 8000 });
  await expect(canvas).toHaveAttribute('data-tier', /^(high|low)$/);
  await expect(canvas).toHaveAttribute('data-running', 'true');
  await expect(page.locator('html')).toHaveClass(/has-sky/);
});

test('aba em segundo plano pausa o loop', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas#sky');
  await expect(canvas).toHaveAttribute('data-running', 'true', { timeout: 8000 });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-running', 'false');
});

test('fora das zonas do céu o loop para', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas#sky');
  await expect(canvas).toHaveAttribute('data-running', 'true', { timeout: 8000 });
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-running', 'false');
  await page.locator('#contato').scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-running', 'true');
});

test.describe('movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('renderiza um quadro parado, sem loop', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas#sky');
    await expect(canvas).toHaveAttribute('data-tier', 'still', { timeout: 8000 });
    await page.waitForTimeout(500);
    await expect(canvas).toHaveAttribute('data-running', 'false');
  });
});

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('o céu WebGL só entra no primeiro gesto; antes, o sol em CSS', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expect(page.locator('canvas#sky')).toHaveCount(0);
    await expect(page.locator('.sky-fallback')).toBeVisible();
    await page.mouse.wheel(0, 300);
    await expect(page.locator('canvas#sky')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('canvas#sky')).toHaveAttribute('data-tier', 'low');
  });
});
