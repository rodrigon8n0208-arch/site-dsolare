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

export type SkyController = {
  setPhase(p: DayPhase, progress: number): void;
  setPointer(x: number, y: number): void;
  setActive(on: boolean): void;
  /** 0–1: os fótons convergem para o retângulo (coordenadas de viewport, px). */
  setCapture(t: number, rect?: DOMRect): void;
  dispose(): void;
};

const hexToVec3 = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export function mountSky(canvas: HTMLCanvasElement, tier: Exclude<Tier, 'none'>): SkyController {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 1.5 : 1));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  const skyUniforms = {
    uTop: { value: hexToVec3('#061529') },
    uHorizon: { value: hexToVec3('#f4901e') },
    uSun: { value: new Vector2(0.78, 0.2) },
    uAspect: { value: 1 },
    uWarmth: { value: 1 },
    uTime: { value: 0 },
    uRays: { value: tier === 'high' ? 1 : 0 },
  };
  const skyMesh = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: skyUniforms, depthTest: false, depthWrite: false }),
  );
  skyMesh.frustumCulled = false;
  skyMesh.renderOrder = -1;
  scene.add(skyMesh);

  const count = tier === 'high' ? PARTICLES.high : tier === 'low' ? PARTICLES.low : Math.round(PARTICLES.low * 0.6);
  const field = createPhotonField(count, 2016);
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
  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    skyUniforms.uAspect.value = aspect;
    photonUniforms.uAspect.value = aspect;
    photonUniforms.uSize.value = (tier === 'high' ? 7 : 6) * renderer.getPixelRatio() * Math.min(1.4, Math.max(0.8, h / 900));
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

  addEventListener('resize', resize);
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
      // o sol fica à direita na manhã (hero e #energia) e só depois atravessa o céu
      const x0 = aspect < 1 ? 0.9 : 0.85;
      const travel = Math.min(1, Math.max(0, (progress - 0.15) / 0.8));
      const eased = travel * travel * (3 - 2 * travel);
      skyUniforms.uSun.value.set(x0 - (x0 - 0.2) * eased, 0.2 + Math.max(-0.05, p.sunElevation) * 0.0095);
      if (!running) render();
    },
    setPointer(x, y) {
      photonUniforms.uPointer.value.set(((x / innerWidth) * 2 - 1) * aspect, -((y / innerHeight) * 2 - 1));
    },
    setActive(on) {
      active = on;
      update();
    },
    setCapture(t, rect) {
      photonUniforms.uCapture.value = t;
      if (rect) {
        const x = ((rect.left / innerWidth) * 2 - 1) * aspect;
        const y = -((rect.bottom / innerHeight) * 2 - 1);
        photonUniforms.uTarget.value.set(x, y, (rect.width / innerWidth) * 2 * aspect, (rect.height / innerHeight) * 2);
      }
      if (!running) render();
    },
    dispose() {
      renderer.setAnimationLoop(null);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', update);
      geo.dispose();
      renderer.dispose();
    },
  };
}
