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

test.describe('assinatura 1 · luz vira energia', () => {
  const pinsAround = (sel: string) => `.pin-spacer:has(> ${sel})`;

  test('desktop: #energia é pinada e todas as células acendem', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(await page.locator(pinsAround('#energia')).count()).toBe(1);
    await expect.poll(() => page.locator('#energia .cell[data-lit="false"]').count()).toBeGreaterThan(0);
    await scrollThrough(page, 200);
    expect(await page.locator('#energia .cell[data-lit="false"]').count()).toBe(0);
    await expect(page.locator('#energia .cell')).toHaveCount(96);
  });

  test('mobile: sem pin, células acendem ao entrar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(await page.locator(pinsAround('#energia')).count()).toBe(0);
    await page.locator('#energia .panel-grid').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('#energia .cell[data-lit="false"]').count(), { timeout: 10000 }).toBe(0);
    await expect(page.locator('#energia-title')).toBeVisible();
  });

  test('hero: count-up termina nos números reais', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expect(page.locator('.ruler__item dd')).toHaveText(['+5.000', '10', '+120', '2016']);
  });
});

test.describe('assinatura 2 · memorial de cálculo', () => {
  const cotasDrawn = (page: import('@playwright/test').Page) =>
    page.evaluate(() => Array.from(document.querySelectorAll<SVGPathElement>('path[data-anim="cota"]')).every((p) => Math.abs(parseFloat(getComputedStyle(p).strokeDashoffset) || 0) < 1));

  test('desktop: pin horizontal termina na etapa 04 com todas as cotas desenhadas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(await page.locator('.pin-spacer:has(.metodo__viewport)').count()).toBe(1);
    await expect(page.locator('#metodo')).toHaveClass(/is-horizontal/);
    await page.evaluate(async () => {
      const sp = document.querySelector('.pin-spacer:has(.metodo__viewport)') as HTMLElement;
      const end = sp.getBoundingClientRect().bottom + scrollY - innerHeight;
      for (let y = scrollY; y < end; y += 200) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      scrollTo(0, end - 20);
      await new Promise((r) => setTimeout(r, 1500));
    });
    await expect(page.locator('[data-step="4"]')).toHaveAttribute('aria-current', 'step');
    expect(await cotasDrawn(page)).toBe(true);
  });

  test('mobile: lista vertical, cotas desenham ao rolar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#metodo')).not.toHaveClass(/is-horizontal/);
    await scrollThrough(page, 300);
    expect(await cotasDrawn(page)).toBe(true);
  });
});

test.describe('movimentos de apoio', () => {
  test('manifesto: riscos começam vazios e terminam completos', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);
    const strikes = () => page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-anim="strike"]')).map((el) => {
      const v = getComputedStyle(el).getPropertyValue('--strike').trim();
      return v === '' ? 1 : parseFloat(v);
    }));
    expect((await strikes()).every((v) => v < 0.05)).toBe(true);
    await scrollThrough(page);
    expect((await strikes()).every((v) => v > 0.99)).toBe(true);
  });

  test('citação: palavras começam apagadas e terminam acesas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);
    const words = page.locator('#citacao [data-anim="words"] .word');
    await expect.poll(() => words.count()).toBeGreaterThan(5);
    expect(await words.first().evaluate((el) => getComputedStyle(el).color)).not.toBe('rgb(255, 255, 255)');
    await scrollThrough(page);
    expect(await hiddenAnimated(page)).toEqual([]);
    expect(await words.last().evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
  });

  test('títulos de seção revelam por linha', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);
    // divididos só perto da tela (economia de CPU no load)
    expect(await page.locator('#projetos .section-title .line').count()).toBe(0);
    await page.locator('#servicos').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('#servicos .section-title .line').count()).toBeGreaterThan(0);
  });

  test('FAQ funciona pelo teclado', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#faq summary').first();
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
    await expect(page.locator('#faq .qa__body').first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#faq details').first()).not.toHaveAttribute('open', '');
  });
});
