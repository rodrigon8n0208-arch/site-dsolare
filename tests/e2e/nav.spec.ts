import { test, expect } from '@playwright/test';

const LINKS = ['servicos', 'metodo', 'projetos', 'sobre', 'faq'];

test('cada link da nav leva ao início da seção, logo abaixo do header', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  await page.waitForTimeout(800);
  for (const id of LINKS) {
    await page.click(`.site-nav a[href="#${id}"]`);
    await page.waitForTimeout(1800);
    const { top, header } = await page.evaluate((i) => ({
      top: document.getElementById(i)!.getBoundingClientRect().top,
      header: document.getElementById('header')!.getBoundingClientRect().height,
    }), id);
    expect(Math.abs(top - header), `#${id} top=${top} header=${header}`).toBeLessThanOrEqual(8);
  }
});

test('Método começa na etapa 01', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(800);
  await page.click('.site-nav a[href="#metodo"]');
  await page.waitForTimeout(1800);
  await expect(page.locator('[data-step="1"]')).toHaveAttribute('aria-current', 'step');
});
