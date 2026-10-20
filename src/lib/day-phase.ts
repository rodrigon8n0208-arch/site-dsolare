export type DayPhase = { hour: number; sunElevation: number; skyTop: string; skyHorizon: string; warmth: number };

type Stop = { at: number; top: string; horizon: string; warmth: number };

const STOPS: Stop[] = [
  { at: 0, top: '#061529', horizon: '#f4901e', warmth: 1 },
  { at: 0.15, top: '#0b3a75', horizon: '#f7b26a', warmth: 0.65 },
  { at: 0.5, top: '#00428c', horizon: '#f5f8fc', warmth: 0.15 },
  { at: 0.85, top: '#00315f', horizon: '#f4901e', warmth: 1 },
  { at: 1, top: '#040d1a', horizon: '#00315f', warmth: 0.3 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) + ((((pb >> shift) & 255) - ((pa >> shift) & 255)) * t));
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
}

/** Progresso do scroll (0–1) → hora do dia em Maceió, das 06h às 19h. */
export function dayPhase(progress: number): DayPhase {
  const p = clamp01(progress);
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1].at) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  return {
    hour: 6 + 13 * p,
    sunElevation: -5 + 80 * Math.sin(Math.PI * p),
    skyTop: mixHex(a.top, b.top, t),
    skyHorizon: mixHex(a.horizon, b.horizon, t),
    warmth: a.warmth + (b.warmth - a.warmth) * t,
  };
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
