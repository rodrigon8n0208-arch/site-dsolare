import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/figtree';
import './styles/tokens.css';
import './styles/base.css';
import { buildPanelGrid } from './ui/panel-grid';
import { initNav } from './ui/nav';
import { initMotion } from './motion/setup';
import { startSky } from './sky/mount';
import { initHero } from './motion/sections/hero';
import { initEnergia } from './motion/sections/energia';
import { initMetodo } from './motion/sections/metodo';
import { createConsent } from './lead/consent';
import { fbqProxy } from './lead/pixel';
import { initConsentBanner, initLeadForm, initQuickForm, prefillFromQuery } from './lead/form';

buildPanelGrid();

const motion = initMotion();
initNav(motion.onProgress);
initHero(motion.mm);
initEnergia(motion.mm);
initMetodo(motion.mm, () => motion.lenis);

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
const bootSky = () => idle(() => void startSky(motion.onProgress));
if (document.readyState === 'complete') bootSky();
else addEventListener('load', bootSky, { once: true });
