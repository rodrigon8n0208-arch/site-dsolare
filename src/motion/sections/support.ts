import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ANY_MOTION, DESKTOP_MOTION } from '../setup';

const once = (trigger: Element, start = 'top 82%') => ({ trigger, start, once: true });

/**
 * Títulos de seção: linhas sobem por máscara. Hero e #energia têm coreografia própria.
 * O texto só é dividido quando o título chega perto da tela: dividir tudo no load custava ~230ms no celular.
 */
function titles() {
  const els = gsap.utils.toArray<HTMLElement>('[data-anim="lines"]').filter((el) => !el.closest('#topo, #energia'));
  const splits: SplitText[] = [];
  els.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom+=320',
      once: true,
      onEnter: () => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
        splits.push(split);
        gsap.from(split.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: once(el) });
      },
    });
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

/** Citação: as palavras acendem com o scroll, como o fim de tarde. */
function citacao() {
  const quote = document.querySelector<HTMLElement>('#citacao [data-anim="words"]');
  if (!quote) return () => {};
  const split = SplitText.create(quote, { type: 'words', wordsClass: 'word' });
  // cor (não opacidade): o tom inicial já tem contraste 3:1 sobre a noite, como pede texto grande
  gsap.fromTo(split.words, { color: '#5b6f8c' }, {
    color: '#ffffff',
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  return () => split.revert();
}

function contato() {
  const form = document.querySelector('.lead-form');
  // o formulário nunca fica invisível: o seletor do hero foca o campo Nome antes de ele entrar na tela
  if (form) gsap.from(form, { y: 48, duration: 1.1, ease: 'expo.out', scrollTrigger: once(form, 'top 95%') });
}

export function initSupport(mm: gsap.MatchMedia): void {
  mm.add({ motion: ANY_MOTION, desktop: DESKTOP_MOTION }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const undo = [titles(), citacao()];
    servicos();
    fotos(!!ctx.conditions.desktop);
    manifesto();
    contato();
    return () => undo.forEach((fn) => fn());
  });
}
