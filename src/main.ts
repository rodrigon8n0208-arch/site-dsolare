import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/figtree';
import './styles/tokens.css';
import './styles/base.css';
import { buildPanelGrid } from './ui/panel-grid';
import { createConsent } from './lead/consent';
import { fbqProxy } from './lead/pixel';
import { initConsentBanner, initLeadForm, initQuickForm, prefillFromQuery } from './lead/form';

buildPanelGrid();

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
