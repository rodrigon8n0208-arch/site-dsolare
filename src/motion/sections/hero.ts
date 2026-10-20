import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ANY_MOTION } from '../setup';

const fmt = new Intl.NumberFormat('pt-BR');

export function initHero(mm: gsap.MatchMedia): void {
  const title = document.querySelector<HTMLElement>('.hero__title');
  const counters = gsap.utils.toArray<HTMLElement>('.ruler [data-count-to]');

  mm.add(ANY_MOTION, () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    let split: SplitText | undefined;
    if (title) {
      split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line' });
      tl.from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.08 }, 0.1);
    }
    tl.from('.hero__lead, .quick, .hero__after', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55)
      .from('.ruler__list', { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, 0.4)
      .from('.hero__coords', { autoAlpha: 0, duration: 1 }, 0.9);

    counters.forEach((el) => {
      const to = Number(el.dataset.countTo);
      const prefix = el.dataset.prefix ?? '';
      const final = el.textContent;
      const state = { v: 0 };
      tl.to(state, {
        v: to,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = prefix + fmt.format(Math.round(state.v)); },
        onComplete: () => { el.textContent = final; },
      }, 0.6);
    });

    return () => {
      split?.revert();
      counters.forEach((el) => { el.textContent = (el.dataset.prefix ?? '') + fmt.format(Number(el.dataset.countTo)); });
    };
  });
}
