import { test, expect } from '@playwright/test';

test('JSON-LD da empresa local é válido e completo', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw!);
  const types = [].concat(data['@type']);
  expect(types).toEqual(expect.arrayContaining(['LocalBusiness']));
  expect(data.telephone).toBe('+55-82-9998-0160');
  expect(data.foundingDate).toBe('2016');
  expect(data.address).toMatchObject({ streetAddress: 'Av. Dr. Júlio Marques Luz, 978 - Jatiúca', addressLocality: 'Maceió', addressRegion: 'AL', postalCode: '57051-160', addressCountry: 'BR' });
  expect(data.vatID).toBe('25.003.808/0001-53');
});

test('imagem de compartilhamento existe e há um único h1', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  const path = new URL(og!).pathname;
  expect((await request.get(path)).status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('página de privacidade carrega estilizada', async ({ page }) => {
  await page.goto('/privacidade.html');
  await expect(page.locator('h1')).toHaveText('Política de Privacidade');
  await expect(page.locator('.doc h2')).toHaveCount(10);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(245, 248, 252)');
});
