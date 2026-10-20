import { describe, it, expect, vi } from 'vitest';
import { createConsent } from '../../src/lead/consent';

function memStorage(init: Record<string, string> = {}) {
  const data = { ...init };
  return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; }, data };
}

describe('consentimento do Meta Pixel', () => {
  it('não rastreia antes do aceite', () => {
    const fbq = vi.fn();
    const c = createConsent(memStorage(), fbq);
    c.track('Lead');
    expect(fbq).not.toHaveBeenCalled();
    expect(c.state()).toBe(null);
  });

  it('ao aceitar libera o pixel, dispara PageView e grava a escolha', () => {
    const fbq = vi.fn();
    const s = memStorage();
    const c = createConsent(s, fbq);
    c.grant();
    expect(fbq).toHaveBeenCalledWith('consent', 'grant');
    expect(fbq).toHaveBeenCalledWith('track', 'PageView');
    expect(s.data.dsolare_consent).toBe('granted');
    c.track('Lead', { cidade: 'Maceió' });
    expect(fbq).toHaveBeenLastCalledWith('track', 'Lead', { cidade: 'Maceió' });
  });

  it('recusar revoga e bloqueia eventos', () => {
    const fbq = vi.fn();
    const s = memStorage();
    const c = createConsent(s, fbq);
    c.deny();
    expect(fbq).toHaveBeenCalledWith('consent', 'revoke');
    expect(s.data.dsolare_consent).toBe('denied');
    c.track('Contact');
    expect(fbq).not.toHaveBeenCalledWith('track', 'Contact');
  });

  it('lembra aceite de visita anterior', () => {
    const fbq = vi.fn();
    const c = createConsent(memStorage({ dsolare_consent: 'granted' }), fbq);
    expect(c.state()).toBe('granted');
    c.track('Contact');
    expect(fbq).toHaveBeenCalledWith('track', 'Contact', {});
  });

  it('localStorage bloqueado não quebra', () => {
    const fbq = vi.fn();
    expect(createConsent(null, fbq).state()).toBe(null);
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    const c = createConsent(throwing, fbq);
    expect(c.state()).toBe(null);
    expect(() => c.grant()).not.toThrow();
  });
});
