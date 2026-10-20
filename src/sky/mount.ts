import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { dayPhase } from '../lib/day-phase';
import { detectQuality, readQualityEnv } from '../lib/quality';
import type { SkyController } from './scene';

type OnProgress = (cb: (p: number) => void) => void;

/** Decide o nível, carrega o Three.js sob demanda e liga o céu ao scroll. */
export async function startSky(onProgress: OnProgress): Promise<SkyController | null> {
  const tier = detectQuality(readQualityEnv());
  const root = document.documentElement;
  if (tier === 'none') {
    root.classList.add('no-webgl');
    return null;
  }

  const { mountSky } = await import('./scene');
  const canvas = document.createElement('canvas');
  canvas.id = 'sky';
  document.querySelector('.sky')?.prepend(canvas);

  let sky: SkyController;
  try {
    sky = mountSky(canvas, tier);
  } catch {
    canvas.remove();
    root.classList.add('no-webgl');
    return null;
  }
  root.classList.add('has-sky');

  onProgress((p) => sky.setPhase(dayPhase(p), p));

  const zones = Array.from(document.querySelectorAll<HTMLElement>('[data-sky-zone]'));
  const inView = new Set<Element>();
  const sync = () => sky.setActive(inView.size > 0);
  zones.forEach((zone) =>
    ScrollTrigger.create({
      trigger: zone,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) inView.add(zone);
        else inView.delete(zone);
        sync();
      },
    }),
  );
  zones.forEach((z) => {
    const r = z.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) inView.add(z);
  });
  sync();

  if (tier === 'high') addEventListener('pointermove', (e) => sky.setPointer(e.clientX, e.clientY), { passive: true });
  return sky;
}
