import { test, expect } from '@playwright/test';
import { scrollThrough, hiddenAnimated } from './helpers';

test.describe('movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('sem pins e nada escondido', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    expect(await page.locator('.pin-spacer').count()).toBe(0);
    expect(await hiddenAnimated(page)).toEqual([]);
  });
});

test('desktop: depois de rolar até o fim, nada fica preso escondido', async ({ page }) => {
  await page.goto('/');
  await scrollThrough(page);
  expect(await hiddenAnimated(page)).toEqual([]);
  await expect(page.locator('.ruler__item dd')).toHaveText(['+5.000', '10', '+120', '2016']);
});

test('header fica sólido ao rolar e o relógio solar acompanha o dia', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#header')).not.toHaveClass(/is-solid/);
  await expect(page.locator('.sun-clock__time')).toHaveText('06:00');
  await page.evaluate(() => scrollTo(0, 120));
  await expect(page.locator('#header')).toHaveClass(/is-solid/);
  await scrollThrough(page);
  await expect(page.locator('.sun-clock__time')).toHaveText('19:00');
});

test('menu mobile abre e fecha com aria-expanded', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const btn = page.locator('#menu-btn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.locator('#mobile-menu a[href="#faq"]').click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('redimensionar no meio da página não quebra o layout', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 3));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.locator('#metodo h2').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(page.locator('#metodo h2')).toBeInViewport();
});
