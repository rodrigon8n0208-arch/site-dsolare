import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [1440, 390]) {
  test.describe(`viewport ${width}`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });

    test('axe sem violações serious/critical', async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto('/');
      const results = await new AxeBuilder({ page }).exclude('.sky').analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });

    test('foco visível em todo controle', async ({ page }) => {
      await page.goto('/');
      const missing = await page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll<HTMLElement>('a[href], button, summary, input:not([type=hidden]), select').forEach((el) => {
          if (el.closest('.hp, [hidden]') || el.offsetParent === null) return;
          el.focus({ focusVisible: true } as FocusOptions);
          if (document.activeElement !== el) return;
          const cs = getComputedStyle(el);
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
          if (!ring) out.push(el.outerHTML.slice(0, 80));
        });
        return out;
      });
      expect(missing).toEqual([]);
    });

    if (width === 390) {
      test('alvos de toque ≥ 44px', async ({ page }) => {
        await page.goto('/');
        const small = await page.evaluate(() => {
          const out: string[] = [];
          document.querySelectorAll<HTMLElement>('a.btn, button, summary, input, select, .site-nav a, .mobile-menu a, .wa-float').forEach((el) => {
            if (el.closest('.hp, [hidden]') || el.offsetParent === null) return;
            const r = el.getBoundingClientRect();
            const isCheck = el instanceof HTMLInputElement && el.type === 'checkbox';
            const target = isCheck ? (el.closest('label') as HTMLElement).getBoundingClientRect() : r;
            if (target.height < 44 || target.width < 44) out.push(`${el.tagName}.${el.className} ${Math.round(target.width)}x${Math.round(target.height)}`);
          });
          return out;
        });
        expect(small).toEqual([]);
      });
    }
  });
}
