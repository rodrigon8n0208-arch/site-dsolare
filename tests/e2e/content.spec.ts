import { test, expect } from '@playwright/test';

const IDS = ['header', 'topo', 'energia', 'servicos', 'metodo', 'projetos', 'sobre', 'manifesto', 'faq', 'citacao', 'contato'];

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('todas as seções existem e seus títulos estão visíveis', async ({ page }) => {
    await page.goto('/');
    for (const id of IDS) {
      const section = page.locator(`#${id}`);
      await expect(section, `#${id}`).toHaveCount(1);
      if (id === 'header') continue;
      const heading = section.locator('h1, h2, blockquote').first();
      await heading.scrollIntoViewIfNeeded();
      await expect(heading, `título de #${id}`).toBeVisible();
    }
  });
});

test('sem rolagem horizontal em 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(390);
});

test('números finais estão no HTML (count-up nunca é a única fonte)', async ({ request }) => {
  const html = await (await request.get('/')).text();
  for (const n of ['+5.000', '>10<', '+120', '2016']) expect(html).toContain(n);
});

test('formulário tem os campos do lead', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('#lead-form');
  for (const name of ['nome', 'whatsapp', 'cidade', 'conta', 'aceite', 'empresa_site']) {
    await expect(form.locator(`[name="${name}"]`), name).toHaveCount(1);
  }
  await expect(form.locator('select[name="conta"] option')).toHaveCount(5);
});
