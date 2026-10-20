/** Gerador pseudoaleatório mulberry32: mesmo seed, mesmo céu. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Campo de fótons em [-1, 1]³, mais denso perto do sol (canto inferior direito). */
export function createPhotonField(count: number, seed: number): { positions: Float32Array; seeds: Float32Array } {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const nearSun = rand() < 0.35;
    const x = nearSun ? 0.5 + (rand() - 0.5) * 0.9 : rand() * 2 - 1;
    const y = nearSun ? -0.45 + (rand() - 0.5) * 0.8 : rand() * 2 - 1;
    positions[i * 3] = Math.max(-1, Math.min(1, x));
    positions[i * 3 + 1] = Math.max(-1, Math.min(1, y));
    positions[i * 3 + 2] = rand() * 2 - 1;
    seeds[i] = rand();
  }
  return { positions, seeds };
}
