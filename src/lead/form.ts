import { buildWhatsAppUrl, type LeadData } from './whatsapp';

function saveLead(endpoint: string, data: LeadData & { origem: string; pagina: string }) {
  if (!endpoint) return;
  const payload = JSON.stringify(data);
  try {
    if (navigator.sendBeacon?.(endpoint, new Blob([payload], { type: 'text/plain;charset=UTF-8' }))) return;
  } catch {
    /* segue para o fetch */
  }
  try {
    void fetch(endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload });
  } catch {
    /* captura é opcional: o WhatsApp abre de qualquer jeito */
  }
}

export function initLeadForm(form: HTMLFormElement, endpoint: string): void {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const honeypot = form.querySelector<HTMLInputElement>('[name="empresa_site"]');
    if (honeypot?.value) return;

    const field = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
    const data: LeadData = { nome: field('nome').trim(), whatsapp: field('whatsapp').trim(), cidade: field('cidade').trim(), conta: field('conta') };

    saveLead(endpoint, { ...data, origem: 'site', pagina: location.href });

    const url = buildWhatsAppUrl(data);
    const win = window.open(url, '_blank', 'noopener');
    if (!win) location.href = url;
  });
}

/** O seletor do hero leva a faixa escolhida ao formulário completo. */
export function initQuickForm(quick: HTMLFormElement, form: HTMLFormElement): void {
  quick.addEventListener('submit', (e) => {
    e.preventDefault();
    const conta = (quick.elements.namedItem('conta') as HTMLSelectElement).value;
    (form.elements.namedItem('conta') as HTMLSelectElement).value = conta;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    form.querySelector<HTMLInputElement>('[name="nome"]')?.focus({ preventScroll: true });
  });
}

/** Na entrada vinda do fallback sem JS (?conta=...), pré-preenche a faixa. */
export function prefillFromQuery(form: HTMLFormElement): void {
  const conta = new URLSearchParams(location.search).get('conta');
  const select = form.elements.namedItem('conta') as HTMLSelectElement;
  if (conta && Array.from(select.options).some((o) => o.value === conta)) select.value = conta;
}

