import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export const DESKTOP_MOTION = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
export const ANY_MOTION = '(prefers-reduced-motion: no-preference)';

export type Motion = {
  mm: gsap.MatchMedia;
  /** Lenis só existe no desktop com movimento; null no resto. */
  readonly lenis: Lenis | null;
  onProgress(cb: (p: number) => void): void;
};

export function initMotion(): Motion {
  document.documentElement.classList.add('has-motion');
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });
  // a barra de endereço do celular aparecendo/sumindo não deve recalcular todos os gatilhos
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();
  let lenis: Lenis | null = null;

  mm.add(DESKTOP_MOTION, () => {
    const instance = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    lenis = instance;
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  });

  const listeners: ((p: number) => void)[] = [];
  const page = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => listeners.forEach((cb) => cb(self.progress)),
    onRefresh: (self) => listeners.forEach((cb) => cb(self.progress)),
  });

  addEventListener('orientationchange', () => ScrollTrigger.refresh());

  return {
    mm,
    get lenis() {
      return lenis;
    },
    onProgress(cb) {
      listeners.push(cb);
      cb(page.progress);
    },
  };
}
