import type { SkyController } from './scene';

let current: SkyController | null = null;

/** O céu chega depois (import dinâmico); as seções consultam quando precisam. */
export const getSky = () => current;
export const setSky = (sky: SkyController | null) => {
  current = sky;
};
