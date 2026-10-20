import { test, expect, type Page } from '@playwright/test';
import { buildWhatsAppUrl } from '../../src/lead/whatsapp';

const lead = { nome: 'Ana Lima', whatsapp: '(82) 98888-7777', cidade: 'Maceió', conta: 'R$ 1.500 a R$ 5.000' };

async function stubOpen(page: Page, returnsNull = false) {
  await page.addInitScript((nul) => {
    (window as any).__opened = [];
    window.open = ((url: string) => { (window as any).__opened.push(url); return nul ? null : ({} as Window); }) as typeof window.open;
  }, returnsNull);
}

async function fill(page: Page) {
  await page.fill('#f-nome', lead.nome);
  await page.fill('#f-whats', lead.whatsapp);
  await page.fill('#f-cidade', lead.cidade);
  await page.selectOption('#f-conta', lead.conta);
  await page.check('input[name="aceite"]');
}

test.beforeEach(async ({ page }) => {
  await page.route('https://connect.facebook.net/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
});

test('envio abre o WhatsApp com a mensagem pronta', async ({ page }) => {
  await stubOpen(page);
  await page.goto('/');
  await fill(page);
  await page.click('#lead-form button[type="submit"]');
  expect(await page.evaluate(() => (window as any).__opened)).toEqual([buildWhatsAppUrl(lead)]);
});

test('honeypot preenchido não envia', async ({ page }) => {
  await stubOpen(page);
  await page.goto('/');
  await fill(page);
  await page.evaluate(() => { (document.querySelector('[name="empresa_site"]') as HTMLInputElement).value = 'spam'; });
  await page.click('#lead-form button[type="submit"]');
  expect(await page.evaluate(() => (window as any).__opened)).toEqual([]);
});

test('pop-up bloqueado cai para navegação direta', async ({ page }) => {
  await stubOpen(page, true);
  await page.route('https://wa.me/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }));
  await page.goto('/');
  await fill(page);
  await Promise.all([page.waitForURL(/^https:\/\/wa\.me\/558299980160\?text=/), page.click('#lead-form button[type="submit"]')]);
});

test('pixel só carrega depois do aceite e registra o Lead', async ({ page }) => {
  await stubOpen(page);
  const pixelRequests: string[] = [];
  page.on('request', (r) => { if (r.url().includes('connect.facebook.net')) pixelRequests.push(r.url()); });
  await page.goto('/');
  await expect(page.locator('#cookie-consent')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).fbq)).toBe('undefined');
  expect(pixelRequests).toEqual([]);

  await page.click('#cc-accept');
  await expect(page.locator('#cookie-consent')).toBeHidden();
  await expect.poll(() => pixelRequests.length).toBeGreaterThan(0);

  await fill(page);
  await page.click('#lead-form button[type="submit"]');
  const queue = await page.evaluate(() => (window as any).fbq.queue.map((a: unknown[]) => Array.from(a)));
  expect(queue).toContainEqual(['init', '407551268600245']);
  expect(queue).toContainEqual(['track', 'PageView']);
  expect(queue).toContainEqual(['track', 'Lead', { content_name: 'analise-conta-luz', cidade: 'Maceió', faixa_conta: lead.conta }]);
});

test('recusar não carrega o pixel e lembra a escolha', async ({ page }) => {
  const pixelRequests: string[] = [];
  page.on('request', (r) => { if (r.url().includes('connect.facebook.net')) pixelRequests.push(r.url()); });
  await page.goto('/');
  await page.click('#cc-decline');
  await page.reload();
  await expect(page.locator('#cookie-consent')).toBeHidden();
  expect(pixelRequests).toEqual([]);
});

test('formulário do hero leva ao formulário completo com a faixa preenchida', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#q-conta', 'R$ 1.500 a R$ 5.000');
  await page.click('.quick button[type="submit"]');
  await expect(page.locator('#f-conta')).toHaveValue('R$ 1.500 a R$ 5.000');
  await expect(page.locator('#f-nome')).toBeFocused();
});
