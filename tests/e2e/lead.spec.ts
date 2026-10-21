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

test('formulário do hero leva ao formulário completo com a faixa preenchida', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#q-conta', 'R$ 1.500 a R$ 5.000');
  await page.click('.quick button[type="submit"]');
  await expect(page.locator('#f-conta')).toHaveValue('R$ 1.500 a R$ 5.000');
  await expect(page.locator('#f-nome')).toBeFocused();
});

test('nenhum rastreador do Facebook é carregado', async ({ page }) => {
  const fb: string[] = [];
  page.on('request', (r) => { if (/facebook\.(net|com)/.test(r.url())) fb.push(r.url()); });
  await page.goto('/');
  await expect(page.locator('#cookie-consent')).toHaveCount(0);
  await page.locator('#contato').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  expect(fb).toEqual([]);
  expect(await page.evaluate(() => typeof (window as any).fbq)).toBe('undefined');
});
