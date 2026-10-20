export type Tier = 'high' | 'low' | 'still' | 'none';

export type QualityEnv = { webgl: boolean; reducedMotion: boolean; cores: number; width: number; saveData: boolean };

export const PARTICLES: Record<'high' | 'low', number> = { high: 6000, low: 1800 };

export function detectQuality(env: QualityEnv): Tier {
  if (!env.webgl) return 'none';
  if (env.reducedMotion) return 'still';
  if (env.saveData || env.cores < 8 || env.width < 1024) return 'low';
  return 'high';
}

/** Lê o ambiente real do navegador. */
export function readQualityEnv(): QualityEnv {
  let webgl = false;
  try {
    const c = document.createElement('canvas');
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    webgl,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    cores: nav.hardwareConcurrency || 4,
    width: innerWidth,
    saveData: !!nav.connection?.saveData,
  };
}
