import { test, expect } from '@playwright/test';

test('com WebGL, cada seção monta a sua cena com nível de qualidade', async ({ page }) => {
  await page.goto('/');
  for (const id of ['hero-light', 'sky']) {
    await expect(page.locator(`canvas#${id}`)).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator(`canvas#${id}`)).toHaveAttribute('data-tier', /^(high|low)$/);
  }
  await expect(page.locator('canvas#hero-light')).toHaveAttribute('data-running', 'true');
  await expect(page.locator('html')).toHaveClass(/has-sky/);
});

test('aba em segundo plano pausa o loop', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas#hero-light');
  await expect(canvas).toHaveAttribute('data-running', 'true', { timeout: 8000 });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-running', 'false');
});

test('cada cena só roda com a sua seção na tela', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('canvas#hero-light');
  const sky = page.locator('canvas#sky');
  await expect(hero).toHaveAttribute('data-running', 'true', { timeout: 8000 });
  await expect(sky).toHaveAttribute('data-running', 'false');
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-running', 'false');
  await expect(sky).toHaveAttribute('data-running', 'false');
  await page.locator('#energia-title').scrollIntoViewIfNeeded();
  await expect(sky).toHaveAttribute('data-running', 'true');
});

test.describe('movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('renderiza um quadro parado, sem loop', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas#hero-light');
    await expect(canvas).toHaveAttribute('data-tier', 'still', { timeout: 8000 });
    await page.waitForTimeout(500);
    await expect(canvas).toHaveAttribute('data-running', 'false');
  });
});

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('a luz WebGL só entra no primeiro gesto; antes, só a foto', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expect(page.locator('canvas#hero-light')).toHaveCount(0);
    await expect(page.locator('.hero__photo')).toBeVisible();
    await page.mouse.wheel(0, 300);
    await expect(page.locator('canvas#hero-light')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('canvas#hero-light')).toHaveAttribute('data-tier', 'low');
  });
});
