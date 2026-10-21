import { dayPhase } from '../lib/day-phase';
import { detectQuality, readQualityEnv } from '../lib/quality';
import type { SceneMode, SkyController } from './scene';
import { setSky } from './holder';

/** Onde está o sol em cada versão da foto do hero (fração da imagem). */
const PHOTO_SUN = {
  desktop: { w: 2400, h: 1624, x: 0.087, y: 0.226 },
  mobile: { w: 1100, h: 1900, x: 0.215, y: 0.232 },
};

/** Converte o sol da foto (object-fit: cover) para coordenadas do contêiner. */
function sunInHero(img: HTMLImageElement, box: DOMRect) {
  const p = img.currentSrc.includes('-m.') ? PHOTO_SUN.mobile : PHOTO_SUN.desktop;
  const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
  const s = Math.max(box.width / p.w, box.height / p.h);
  const dw = p.w * s;
  const dh = p.h * s;
  return { x: ((box.width - dw) * (px || 0.5) + p.x * dw) / box.width, y: ((box.height - dh) * (py || 0.5) + p.y * dh) / box.height };
}

/** Decide o nível, carrega o Three.js sob demanda e monta as duas cenas, cada uma dentro da sua seção. */
export async function startScenes(): Promise<void> {
  const tier = detectQuality(readQualityEnv());
  const root = document.documentElement;
  if (tier === 'none') {
    root.classList.add('no-webgl');
    return;
  }
  const { mountSky } = await import('./scene');

  const mount = (host: HTMLElement | null, id: string, mode: SceneMode): SkyController | null => {
    if (!host) return null;
    const canvas = document.createElement('canvas');
    canvas.id = id;
    host.prepend(canvas);
    try {
      const ctrl = mountSky(canvas, tier, mode);
      // cada cena só roda enquanto a sua seção está na tela
      const section = host.closest('section') ?? host;
      new IntersectionObserver(([e]) => ctrl.setActive(e.isIntersecting)).observe(section);
      return ctrl;
    } catch {
      canvas.remove();
      return null;
    }
  };

  const light = mount(document.querySelector('[data-light]'), 'hero-light', 'light');
  const sky = mount(document.querySelector('[data-sky]'), 'sky', 'sky');
  if (!light && !sky) {
    root.classList.add('no-webgl');
    return;
  }
  root.classList.add('has-sky');

  if (light) {
    const hero = document.getElementById('topo')!;
    const img = hero.querySelector<HTMLImageElement>('.hero__photo')!;
    const place = () => {
      const s = sunInHero(img, hero.getBoundingClientRect());
      light.setSun(s.x, s.y);
    };
    if (img.complete) place();
    img.addEventListener('load', place);
    new ResizeObserver(place).observe(hero);
  }
  if (sky) {
    sky.setPhase(dayPhase(0.04), 0);
    setSky(sky);
  }

  if (tier === 'high') {
    addEventListener('pointermove', (e) => {
      light?.setPointer(e.clientX, e.clientY);
      sky?.setPointer(e.clientX, e.clientY);
    }, { passive: true });
  }
}
