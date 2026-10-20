import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { DESKTOP_MOTION } from '../setup';
import { getSky } from '../../sky/holder';

/** Ordem de acendimento: a luz chega do lado do sol (direita, em cima) e varre o painel. */
function byLightOrder(cells: HTMLElement[], cols: number): HTMLElement[] {
  return cells
    .map((cell, i) => ({ cell, d: Math.hypot(cols - 1 - (i % cols), Math.floor(i / cols)) + ((i * 7) % 5) * 0.35 }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.cell);
}

function lightUpTo(ordered: HTMLElement[], n: number) {
  ordered.forEach((c, i) => {
    const lit = i < n ? 'true' : 'false';
    if (c.dataset.lit !== lit) c.dataset.lit = lit;
  });
}

export function initEnergia(mm: gsap.MatchMedia): void {
  const section = document.getElementById('energia');
  const grid = section?.querySelector<HTMLElement>('.panel-grid');
  const title = document.getElementById('energia-title');
  if (!section || !grid || !title) return;
  const cells = Array.from(grid.children) as HTMLElement[];
  const cols = () => parseInt(getComputedStyle(grid).getPropertyValue('--cols')) || 12;

  mm.add(DESKTOP_MOTION, () => {
    const ordered = byLightOrder(cells, cols());
    lightUpTo(ordered, 0);
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
    const state = { capture: 0, lit: 0 };
    // alvo um pouco menor que o retângulo: a perspectiva estreita o topo do painel
    const target = () => {
      const r = grid.getBoundingClientRect();
      return new DOMRect(r.x + r.width * 0.14, r.y + r.height * 0.08, r.width * 0.72, r.height * 0.84);
    };
    const capture = () => getSky()?.setCapture(state.capture, target());

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', pin: true, scrub: 0.6 },
    });
    tl.to(state, { capture: 1, duration: 1, ease: 'power2.inOut', onUpdate: capture }, 0)
      .to(state, { lit: cells.length, duration: 1, onUpdate: () => lightUpTo(ordered, Math.round(state.lit)) }, 0.3)
      .from(split.lines, { yPercent: 105, duration: 0.5, stagger: 0.12, ease: 'power3.out' }, 1.05)
      .to(state, { capture: 0, duration: 0.45, ease: 'power2.in', onUpdate: capture }, 1.45);

    return () => {
      split.revert();
      lightUpTo(ordered, cells.length);
      getSky()?.setCapture(0);
    };
  });

  mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
    const ordered = byLightOrder(cells, cols());
    lightUpTo(ordered, 0);
    const state = { lit: 0 };
    const tween = gsap.to(state, {
      lit: cells.length,
      duration: 1.4,
      ease: 'power1.inOut',
      paused: true,
      onUpdate: () => lightUpTo(ordered, Math.round(state.lit)),
    });
    const st = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 80%', once: true, onEnter: () => tween.play() } });
    return () => {
      st.kill();
      tween.kill();
      lightUpTo(ordered, cells.length);
    };
  });
}
