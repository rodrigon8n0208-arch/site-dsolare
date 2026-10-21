import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three';
import type { DayPhase } from '../lib/day-phase';
import { PARTICLES, type Tier } from '../lib/quality';
import { createPhotonField } from './particles';
import skyVert from './shaders/sky.vert?raw';
import skyFrag from './shaders/sky.frag?raw';
import photonsVert from './shaders/photons.vert?raw';
import photonsFrag from './shaders/photons.frag?raw';

/** 'light': só partículas, fundo transparente (sobre a foto do hero). 'sky': céu de amanhecer + partículas. */
export type SceneMode = 'light' | 'sky';

export type SkyController = {
  setPhase(p: DayPhase, progress: number): void;
  /** Posição do sol em fração do canvas (0–1, origem no canto superior esquerdo). */
  setSun(x: number, y: number): void;
  setPointer(clientX: number, clientY: number): void;
  setActive(on: boolean): void;
  /** 0–1: os fótons convergem para o retângulo (coordenadas de viewport, px). */
  setCapture(t: number, rect?: DOMRect): void;
  dispose(): void;
};

const hexToVec3 = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export function mountSky(canvas: HTMLCanvasElement, tier: Exclude<Tier, 'none'>, mode: SceneMode = 'sky'): SkyController {
  const transparent = mode === 'light';
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: transparent, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 1.5 : 1));
  if (transparent) renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  const skyUniforms = {
    uTop: { value: hexToVec3('#061529') },
    uHorizon: { value: hexToVec3('#f4901e') },
    uSun: { value: new Vector2(0.85, 0.2) },
    uAspect: { value: 1 },
    uWarmth: { value: 1 },
    uTime: { value: 0 },
    uRays: { value: tier === 'high' ? 1 : 0 },
  };
  if (!transparent) {
    const skyMesh = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: skyUniforms, depthTest: false, depthWrite: false }),
    );
    skyMesh.frustumCulled = false;
    skyMesh.renderOrder = -1;
    scene.add(skyMesh);
  }

  const base = tier === 'high' ? PARTICLES.high : tier === 'low' ? PARTICLES.low : Math.round(PARTICLES.low * 0.6);
  const count = transparent ? Math.round(base * 0.36) : base;
  const field = createPhotonField(count, transparent ? 7 : 2016);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(field.positions, 3));
  geo.setAttribute('aSeed', new BufferAttribute(field.seeds, 1));
  const photonUniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uSize: { value: 0 },
    uPointer: { value: new Vector2(99, 99) },
    uPointerOn: { value: tier === 'high' ? 1 : 0 },
    uSun: skyUniforms.uSun,
    uWarmth: skyUniforms.uWarmth,
    uCapture: { value: 0 },
    uTarget: { value: new Vector4(0, 0, 0, 0) },
    uCalm: { value: transparent ? 0 : 1 },
  };
  const photons = new Points(
    geo,
    new ShaderMaterial({
      vertexShader: photonsVert,
      fragmentShader: photonsFrag,
      uniforms: photonUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      premultipliedAlpha: true,
    }),
  );
  photons.frustumCulled = false;
  scene.add(photons);

  let elapsed = 0;
  const render = () => {
    skyUniforms.uTime.value = elapsed;
    photonUniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
  };

  let aspect = 1;
  let running = false;
  const host = canvas.parentElement ?? canvas;
  const resize = () => {
    const w = host.clientWidth || innerWidth;
    const h = host.clientHeight || innerHeight;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    skyUniforms.uAspect.value = aspect;
    photonUniforms.uAspect.value = aspect;
    photonUniforms.uSize.value = (tier === 'high' ? 7 : 6) * (transparent ? 1.05 : 1) * renderer.getPixelRatio() * Math.min(1.4, Math.max(0.8, h / 900));
    if (!running) render();
  };

  const start = performance.now();
  let active = true;
  const update = () => {
    const shouldRun = tier !== 'still' && active && !document.hidden;
    if (shouldRun === running) return;
    running = shouldRun;
    canvas.dataset.running = String(running);
    renderer.setAnimationLoop(
      running
        ? () => {
            elapsed = (performance.now() - start) / 1000;
            render();
          }
        : null,
    );
  };

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  document.addEventListener('visibilitychange', update);
  canvas.dataset.tier = tier;
  canvas.dataset.running = 'false';
  resize();
  update();

  return {
    setPhase(p, progress) {
      skyUniforms.uTop.value.copy(hexToVec3(p.skyTop));
      skyUniforms.uHorizon.value.copy(hexToVec3(p.skyHorizon));
      skyUniforms.uWarmth.value = p.warmth;
      const x0 = aspect < 1 ? 0.9 : 0.85;
      skyUniforms.uSun.value.set(x0 - 0.1 * progress, 0.2 + Math.max(-0.05, p.sunElevation) * 0.0095);
      if (!running) render();
    },
    setSun(x, y) {
      skyUniforms.uSun.value.set(x, 1 - y);
      if (!running) render();
    },
    setPointer(clientX, clientY) {
      const box = canvas.getBoundingClientRect();
      const x = (clientX - box.left) / box.width;
      const y = (clientY - box.top) / box.height;
      photonUniforms.uPointer.value.set((x * 2 - 1) * aspect, -(y * 2 - 1));
    },
    setActive(on) {
      active = on;
      update();
    },
    setCapture(t, rect) {
      photonUniforms.uCapture.value = t;
      if (rect) {
        const box = canvas.getBoundingClientRect();
        const x = (((rect.left - box.left) / box.width) * 2 - 1) * aspect;
        const y = -(((rect.bottom - box.top) / box.height) * 2 - 1);
        photonUniforms.uTarget.value.set(x, y, (rect.width / box.width) * 2 * aspect, (rect.height / box.height) * 2);
      }
      if (!running) render();
    },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      document.removeEventListener('visibilitychange', update);
      geo.dispose();
      renderer.dispose();
    },
  };
}
