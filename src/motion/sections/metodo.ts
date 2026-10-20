import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { ANY_MOTION, DESKTOP_MOTION } from '../setup';

function setCurrent(steps: HTMLElement[], index: number) {
  steps.forEach((s, i) => {
    if (i === index) s.setAttribute('aria-current', 'step');
    else s.removeAttribute('aria-current');
  });
}

/** Desenha as cotas e acende os campos de uma etapa. */
function drawStep(tl: gsap.core.Timeline, step: HTMLElement, at: number | string) {
  const cotas = step.querySelectorAll('[data-anim="cota"]');
  const fields = step.querySelectorAll('.field');
  tl.from(cotas, { drawSVG: '0%', duration: 0.6, stagger: 0.12, ease: 'power2.inOut' }, at);
  if (fields.length) tl.add(() => fields.forEach((f) => f.classList.add('is-on')), at);
}

export function initMetodo(mm: gsap.MatchMedia, getLenis: () => Lenis | null): void {
  const section = document.getElementById('metodo');
  const viewport = section?.querySelector<HTMLElement>('.metodo__viewport');
  const track = section?.querySelector<HTMLElement>('.metodo__track');
  if (!section || !viewport || !track) return;
  const steps = Array.from(track.querySelectorAll<HTMLElement>('.step'));
  setCurrent(steps, 0);

  mm.add(DESKTOP_MOTION, () => {
    section.classList.add('is-horizontal');
    const distance = () => track.scrollWidth - viewport.clientWidth;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'metodo',
        trigger: viewport,
        start: () => `top top+=${document.getElementById('header')?.offsetHeight ?? 72}`,
        end: () => `+=${distance() * 1.15}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => setCurrent(steps, Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999))),
      },
    });
    // pausa curta na etapa 01 antes de o trilho andar
    const hold = 0.4;
    tl.to(track, { x: () => -distance(), duration: steps.length - 1 }, hold);
    steps.forEach((step, i) => drawStep(tl, step, i === 0 ? 0 : hold + i - 0.55));
    tl.to({}, { duration: 0.35 });

    return () => {
      section.classList.remove('is-horizontal');
      gsap.set(track, { clearProps: 'transform' });
      setCurrent(steps, 0);
    };
  });

  mm.add(`${ANY_MOTION} and (max-width: 1023px)`, () => {
    const tls = steps.map((step, i) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: step, start: 'top 75%', once: true, onEnter: () => setCurrent(steps, i) },
      });
      drawStep(tl, step, 0);
      return tl;
    });
    return () => tls.forEach((t) => t.kill());
  });

  // âncoras da nav: com Lenis, rola até o início real da seção (antes de qualquer pin)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const lenis = getLenis();
      const id = a.getAttribute('href')!.slice(1);
      const target = id && document.getElementById(id);
      if (!lenis || !target) return;
      e.preventDefault();
      // o Lenis já desconta o scroll-padding-top (altura do header) do <html>
      lenis.scrollTo(target, { duration: 1.1 });
      history.replaceState(null, '', `#${id}`);
    });
  });
}
