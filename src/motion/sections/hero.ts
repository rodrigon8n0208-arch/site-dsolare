import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ANY_MOTION, DESKTOP_MOTION } from '../setup';

const fmt = new Intl.NumberFormat('pt-BR');

export function initHero(mm: gsap.MatchMedia): void {
  const hero = document.getElementById('topo');
  const title = document.querySelector<HTMLElement>('.hero__title');
  const counters = gsap.utils.toArray<HTMLElement>('.hero [data-count-to]');
  if (!hero) return;

  mm.add(ANY_MOTION, () => {
    const desktop = matchMedia(DESKTOP_MOTION).matches;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    // a foto "acorda": aproxima devagar e a palavra gigante sobe por trás
    tl.fromTo('.hero__photo', { scale: 1.14 }, { scale: 1.04, duration: 2.4, ease: 'power2.out' }, 0)
      .from('.hero__word', { yPercent: 18, opacity: 0, duration: 1.6 }, 0.15);

    let split: SplitText | undefined;
    // no celular o título aparece de imediato: é o LCP, e dividir o texto custa CPU
    if (title && desktop) {
      split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line' });
      tl.from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.08 }, 0.25);
    }
    tl.from('.pill', { y: 16, opacity: 0, duration: 0.8 }, 0.2)
      .from('.hero__lead, .quick, .hero__note', { y: 22, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.55)
      .from('.glass-stat, .mini-stat', { y: 28, opacity: 0, duration: 1, stagger: 0.07 }, 0.7);

    counters.forEach((el) => {
      const to = Number(el.dataset.countTo);
      const prefix = el.dataset.prefix ?? '';
      const final = el.textContent;
      const state = { v: 0 };
      tl.to(state, {
        v: to,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = prefix + fmt.format(Math.round(state.v)); },
        onComplete: () => { el.textContent = final; },
      }, 0.8);
    });

    // saída: ao rolar, a foto desce mais devagar que o texto (profundidade) e escurece para a noite
    const out = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    out.to('.hero__media', { yPercent: 18, ease: 'none' }, 0)
      .to('.hero__word', { yPercent: -30, ease: 'none' }, 0)
      .to('.hero__inner', { y: -60, ease: 'none' }, 0);

    return () => {
      split?.revert();
      counters.forEach((el) => { el.textContent = (el.dataset.prefix ?? '') + fmt.format(Number(el.dataset.countTo)); });
    };
  });
}
