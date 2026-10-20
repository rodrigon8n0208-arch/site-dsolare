const PIXEL_ID = '407551268600245';

type FbqFn = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...a: unknown[]) => void };
declare global {
  interface Window { fbq?: FbqFn; _fbq?: FbqFn }
}

/** Snippet oficial do Meta Pixel, carregado só depois do consentimento. */
function loadPixel(): FbqFn {
  if (window.fbq) return window.fbq;
  const n: FbqFn & { push?: unknown; loaded?: boolean; version?: string } = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue!.push(args);
  };
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.append(s);
  n('init', PIXEL_ID);
  return n;
}

/** Encaminha chamadas ao pixel; nada é carregado até haver um 'grant'. */
export function fbqProxy(...args: unknown[]): void {
  if (!window.fbq) {
    if (args[0] !== 'consent' || args[1] !== 'grant') return;
    loadPixel();
  }
  window.fbq!(...args);
}
