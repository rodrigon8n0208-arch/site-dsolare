import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/figtree';
import './styles/tokens.css';
import './styles/base.css';
import { buildPanelGrid } from './ui/panel-grid';
import { initNav } from './ui/nav';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotion } from './motion/setup';
import { startSky } from './sky/mount';
import { initHero } from './motion/sections/hero';
import { initEnergia } from './motion/sections/energia';
import { initMetodo } from './motion/sections/metodo';
import { initSupport } from './motion/sections/support';
import { createConsent } from './lead/consent';
import { fbqProxy } from './lead/pixel';
import { initConsentBanner, initLeadForm, initQuickForm, prefillFromQuery } from './lead/form';

buildPanelGrid();

const motion = initMotion();
initNav(motion.onProgress);
initHero(motion.mm);

// O resto da coreografia é montado em tarefas separadas, devolvendo a thread entre elas:
// no celular, montar tudo de uma vez travava a página por ~1s (TBT).
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));
void (async () => {
  for (const init of [() => initEnergia(motion.mm), () => initMetodo(motion.mm, () => motion.lenis), () => initSupport(motion.mm)]) {
    await yieldToMain();
    init();
  }
  // cada refresh força um layout da página inteira; se o load ainda vem, o ScrollTrigger já recalcula nele
  if (document.readyState === 'complete') ScrollTrigger.refresh();
})();

let storage: Storage | null = null;
try { storage = window.localStorage; } catch { /* bloqueado */ }
const consent = createConsent(storage, fbqProxy);

const banner = document.getElementById('cookie-consent');
if (banner) initConsentBanner(banner, consent);

const form = document.getElementById('lead-form') as HTMLFormElement | null;
if (form) {
  initLeadForm(form, consent, import.meta.env.VITE_LEAD_ENDPOINT ?? '');
  prefillFromQuery(form);
  const quick = document.querySelector<HTMLFormElement>('[data-quick]');
  if (quick) initQuickForm(quick, form);
}

const ano = document.getElementById('ano');
if (ano) ano.textContent = String(new Date().getFullYear());

// O céu WebGL entra depois do primeiro paint: o LCP é o texto do hero, nunca o canvas.
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
let skyStarted = false;
const bootSky = () => {
  if (skyStarted) return;
  skyStarted = true;
  idle(() => void startSky(motion.onProgress));
};
// no desktop o céu entra quando a página assenta; no celular, no primeiro gesto —
// até lá o sol em CSS ocupa o lugar e o Three.js não disputa CPU com o carregamento
if (matchMedia('(min-width: 1024px)').matches) {
  if (document.readyState === 'complete') bootSky();
  else addEventListener('load', bootSky, { once: true });
} else {
  for (const ev of ['scroll', 'touchstart', 'pointerdown', 'keydown'] as const) addEventListener(ev, bootSky, { once: true, passive: true });
}
