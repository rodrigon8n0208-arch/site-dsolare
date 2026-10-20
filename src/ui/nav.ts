import { dayPhase, formatHour } from '../lib/day-phase';

export function initNav(onProgress: (cb: (p: number) => void) => void): void {
  const header = document.getElementById('header');
  const sun = document.querySelector<SVGCircleElement>('.sun-clock__sun');
  const time = document.querySelector<HTMLElement>('.sun-clock__time');
  const root = document.documentElement.style;

  const solid = () => header?.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', solid, { passive: true });
  solid();

  let lastMinute = '';
  onProgress((p) => {
    const phase = dayPhase(p);
    const label = formatHour(phase.hour);
    if (label === lastMinute) return;
    lastMinute = label;
    if (time) time.textContent = label;
    if (sun) {
      const a = Math.PI * (1 - p);
      sun.setAttribute('cx', (32 + 30 * Math.cos(a)).toFixed(2));
      sun.setAttribute('cy', (22 - 20 * Math.sin(a)).toFixed(2));
    }
    root.setProperty('--sky-top', phase.skyTop);
    root.setProperty('--sky-horizon', phase.skyHorizon);
  });

  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const setOpen = (open: boolean) => {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
}
