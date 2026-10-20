export type ConsentState = 'granted' | 'denied' | null;
type Store = Pick<Storage, 'getItem' | 'setItem'>;
type Fbq = (...args: unknown[]) => void;

const KEY = 'dsolare_consent';

function read(storage: Store | null): ConsentState {
  try {
    const v = storage?.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function write(storage: Store | null, v: Exclude<ConsentState, null>) {
  try {
    storage?.setItem(KEY, v);
  } catch {
    /* modo privado / armazenamento bloqueado: a escolha vale só para esta visita */
  }
}

export function createConsent(storage: Store | null, fbq: Fbq) {
  let current = read(storage);

  return {
    state: (): ConsentState => current,
    grant() {
      current = 'granted';
      write(storage, current);
      fbq('consent', 'grant');
      fbq('track', 'PageView');
    },
    deny() {
      current = 'denied';
      write(storage, current);
      fbq('consent', 'revoke');
    },
    track(event: string, params: object = {}) {
      if (current !== 'granted') return;
      fbq('track', event, params);
    },
  };
}

export type Consent = ReturnType<typeof createConsent>;
