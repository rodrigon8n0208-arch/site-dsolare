import { describe, it, expect } from 'vitest';
import { dayPhase, formatHour } from '../../src/lib/day-phase';

describe('dayPhase', () => {
  it('vai de 06h a 19h', () => {
    expect(dayPhase(0).hour).toBe(6);
    expect(dayPhase(1).hour).toBe(19);
  });

  it('limita o progresso a [0, 1]', () => {
    expect(dayPhase(-1)).toEqual(dayPhase(0));
    expect(dayPhase(2)).toEqual(dayPhase(1));
  });

  it('o sol está mais alto ao meio da página', () => {
    const e = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1].map((p) => dayPhase(p).sunElevation);
    expect(Math.max(...e)).toBe(dayPhase(0.5).sunElevation);
    expect(dayPhase(0).sunElevation).toBeLessThan(0);
    expect(dayPhase(1).sunElevation).toBeLessThan(0);
  });

  it('cores das paradas exatas', () => {
    expect(dayPhase(0).skyTop).toBe('#061529');
    expect(dayPhase(0.5).skyTop).toBe('#00428c');
    expect(dayPhase(0.85).skyHorizon).toBe('#f4901e');
    expect(dayPhase(1).skyTop).toBe('#040d1a');
  });

  it('calor alto no amanhecer e no pôr do sol, baixo ao meio-dia', () => {
    expect(dayPhase(0).warmth).toBeGreaterThan(0.8);
    expect(dayPhase(0.85).warmth).toBeGreaterThan(0.8);
    expect(dayPhase(0.5).warmth).toBeLessThan(0.3);
  });

  it('formata a hora como relógio', () => {
    expect(formatHour(6)).toBe('06:00');
    expect(formatHour(12.5)).toBe('12:30');
    expect(formatHour(18.99)).toBe('18:59');
  });
});
