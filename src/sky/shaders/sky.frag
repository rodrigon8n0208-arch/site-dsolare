precision highp float;
varying vec2 vUv;
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec2 uSun;      // posição do sol em uv
uniform float uAspect;
uniform float uWarmth;
uniform float uTime;
uniform float uRays;    // 1.0 no nível high

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = vUv;
  // céu: horizonte → topo, com a luz concentrada no terço de baixo
  float h = smoothstep(0.2, 0.75, uv.y);
  // o brilho do horizonte se concentra em volta do sol; longe dele o céu fica azul-violeta
  float nearSunX = exp(-abs(uv.x - uSun.x) * uAspect * 1.6);
  vec3 horizon = mix(mix(uTop, vec3(0.17, 0.16, 0.33), 0.55), uHorizon, mix(0.18, 1.0, nearSunX));
  vec3 sky = mix(horizon, uTop, pow(h, 0.55));
  // faixa azul-profunda no meio para o gradiente não lavar
  float band = smoothstep(0.28, 0.5, uv.y) * (1.0 - smoothstep(0.5, 0.95, uv.y));
  sky = mix(sky, mix(uTop, vec3(0.043, 0.165, 0.333), 0.6), band * 0.35);

  vec2 d = (uv - uSun) * vec2(uAspect, 1.0);
  float r = length(d);
  vec3 warm = mix(vec3(1.0, 0.77, 0.42), vec3(1.0, 0.55, 0.12), uWarmth);

  float core = smoothstep(0.042, 0.03, r);
  float halo = exp(-r * 7.0) * 0.85 + exp(-r * 2.2) * 0.28 * uWarmth;

  float rays = 0.0;
  if (uRays > 0.5) {
    float a = atan(d.y, d.x);
    float beams = sin(a * 13.0 + uTime * 0.05) * 0.5 + 0.5;
    beams *= sin(a * 7.0 - uTime * 0.08 + 1.3) * 0.5 + 0.5;
    rays = pow(beams, 3.0) * exp(-r * 3.2) * 0.32;
  }

  vec3 col = sky + warm * (halo + rays) + vec3(1.0, 0.95, 0.85) * core;
  // dither contra banding
  col += (hash(uv * 1000.0 + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
