import { describe, it, expect } from 'vitest';
import { createPhotonField } from '../../src/sky/particles';

describe('createPhotonField', () => {
  it('gera 3 coordenadas e 1 seed por fóton', () => {
    const f = createPhotonField(100, 7);
    expect(f.positions.length).toBe(300);
    expect(f.seeds.length).toBe(100);
  });

  it('é determinístico pelo seed', () => {
    expect(createPhotonField(50, 7).positions).toEqual(createPhotonField(50, 7).positions);
    expect(createPhotonField(50, 7).positions).not.toEqual(createPhotonField(50, 8).positions);
  });

  it('todos os pontos ficam em [-1, 1]³ e seeds em [0, 1)', () => {
    const f = createPhotonField(2000, 3);
    expect(f.positions.every((v) => v >= -1 && v <= 1)).toBe(true);
    expect(f.seeds.every((v) => v >= 0 && v < 1)).toBe(true);
  });
});
