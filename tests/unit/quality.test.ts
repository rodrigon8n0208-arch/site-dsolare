import { describe, it, expect } from 'vitest';
import { detectQuality, PARTICLES } from '../../src/lib/quality';

const base = { webgl: true, reducedMotion: false, cores: 8, width: 1440, saveData: false };

describe('detectQuality', () => {
  it('sem WebGL → none', () => expect(detectQuality({ ...base, webgl: false })).toBe('none'));
  it('movimento reduzido → still', () => expect(detectQuality({ ...base, reducedMotion: true })).toBe('still'));
  it('sem WebGL vence movimento reduzido', () => expect(detectQuality({ ...base, webgl: false, reducedMotion: true })).toBe('none'));
  it('desktop forte → high', () => expect(detectQuality(base)).toBe('high'));
  it('poucos núcleos → low', () => expect(detectQuality({ ...base, cores: 4 })).toBe('low'));
  it('tela estreita → low', () => expect(detectQuality({ ...base, width: 1023 })).toBe('low'));
  it('economia de dados → low', () => expect(detectQuality({ ...base, saveData: true })).toBe('low'));
  it('contagem de partículas', () => expect(PARTICLES).toEqual({ high: 6000, low: 1800 }));
});
