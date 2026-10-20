import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ANY_MOTION, DESKTOP_MOTION } from '../setup';

const once = (trigger: Element, start = 'top 82%') => ({ trigger, start, once: true });

/** Títulos de seção: linhas sobem por máscara. Hero e #energia têm coreografia própria. */
function titles() {
  const els = gsap.utils.toArray<HTMLElement>('[data-anim="lines"]').filter((el) => !el.closest('#topo, #energia'));
  const splits = els.map((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(split.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: once(el) });
    return split;
  });
  return () => splits.forEach((s) => s.revert());
}

/** Serviços: uma faixa de luz atravessa cada linha quando ela entra. */
function servicos() {
  gsap.utils.toArray<HTMLElement>('.service').forEach((row) => {
    gsap.timeline({ scrollTrigger: once(row, 'top 78%') })
      .fromTo(row, { '--sweep': '-110%' }, { '--sweep': '110%', duration: 1.6, ease: 'power2.inOut' })
      .from(row.querySelector('.service__name'), { x: -24, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.1)
      .from(row.querySelectorAll('.service__text, .service__claim'), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0.25);
  });
}

/** Fotos: revelação por máscara retangular; no desktop, parallax interno. */
function fotos(desktop: boolean) {
  gsap.utils.toArray<HTMLElement>('[data-anim="mask"]').forEach((frame) => {
    const img = frame.querySelector('img');
    gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: once(frame, 'top 85%') });
    if (img && desktop) {
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });
}

/** Manifesto: cada má prática é riscada; a resposta da D'Solare acende. */
function manifesto() {
  gsap.utils.toArray<HTMLElement>('.practice').forEach((item) => {
    const strike = item.querySelector('[data-anim="strike"]');
    const answer = item.querySelector('.practice__answer');
    const tl = gsap.timeline({ scrollTrigger: once(item, 'top 72%') });
    tl.fromTo(strike, { '--strike': 0 }, { '--strike': 1, duration: 0.7, ease: 'power3.inOut' });
    if (answer) tl.from(answer, { color: '#a9bbd3', duration: 0.8, ease: 'power1.out' }, 0.5);
  });
  gsap.set('[data-anim="strike"]', { '--strike': 0 });
}

/** Citação: as palavras acendem com o scroll, como o dia clareando. */
function citacao() {
  const quote = document.querySelector<HTMLElement>('#citacao [data-anim="words"]');
  if (!quote) return () => {};
  const split = SplitText.create(quote, { type: 'words', wordsClass: 'word' });
  gsap.fromTo(split.words, { opacity: 0.15 }, {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  return () => split.revert();
}

function contato() {
  const form = document.querySelector('.lead-form');
  if (form) gsap.from(form, { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: once(form, 'top 88%') });
  gsap.from('.contacts > div', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out', scrollTrigger: once(document.querySelector('.contacts')!, 'top 90%') });
}

export function initSupport(mm: gsap.MatchMedia): void {
  mm.add({ motion: ANY_MOTION, desktop: DESKTOP_MOTION }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const undo = [titles(), citacao()];
    servicos();
    fotos(!!ctx.conditions.desktop);
    manifesto();
    contato();
    ScrollTrigger.refresh();
    return () => undo.forEach((fn) => fn());
  });
}
