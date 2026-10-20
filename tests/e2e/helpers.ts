import type { Page } from '@playwright/test';

/** Rola a página inteira em passos, como uma pessoa, e espera o scrub assentar. */
export async function scrollThrough(page: Page, step = 400) {
  await page.evaluate(async (s) => {
    const max = () => document.documentElement.scrollHeight - innerHeight;
    for (let y = 0; y <= max(); y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    scrollTo(0, max());
    await new Promise((r) => setTimeout(r, 1200));
  }, step);
}

/** Lista elementos animáveis (ou filhos com opacity inline) ainda transparentes. */
export async function hiddenAnimated(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll<HTMLElement>('[data-anim], [data-anim] *').forEach((el) => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.99) out.push(`${el.tagName}.${el.className}`.slice(0, 60));
    });
    return out;
  });
}
