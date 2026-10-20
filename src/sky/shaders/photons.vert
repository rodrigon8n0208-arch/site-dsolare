attribute float aSeed;
uniform float uTime;
uniform float uAspect;
uniform float uSize;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform vec2 uSun;
uniform float uCapture;
uniform vec4 uTarget;   // x, y (canto inferior esquerdo), largura, altura no espaço da câmera
varying float vAlpha;
varying float vNearSun;

void main() {
  vec3 p = position;
  float speed = 0.012 + aSeed * 0.035;
  p.y = mod(p.y + 1.0 + uTime * speed, 2.0) - 1.0;
  p.x += sin(uTime * (0.2 + aSeed * 0.5) + aSeed * 6.2831) * 0.035;
  p.x *= uAspect;

  // o cursor afasta a luz
  vec2 toP = p.xy - uPointer;
  float push = smoothstep(0.32, 0.0, length(toP)) * uPointerOn;
  p.xy += normalize(toP + 1e-4) * push * 0.12;

  // captura: os fótons convergem para as células do painel
  vec2 cell = uTarget.xy + vec2(fract(aSeed * 91.7), fract(aSeed * 47.3)) * uTarget.zw;
  float k = smoothstep(0.0, 1.0, clamp(uCapture * 1.6 - aSeed * 0.6, 0.0, 1.0));
  p.xy = mix(p.xy, cell, k);

  vec2 sunClip = vec2((uSun.x * 2.0 - 1.0) * uAspect, uSun.y * 2.0 - 1.0);
  vNearSun = smoothstep(1.1, 0.0, distance(p.xy, sunClip));
  float twinkle = 0.35 + 0.65 * (sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 40.0) * 0.5 + 0.5);
  // coluna do texto (esquerda) fica calma; a luz se adensa perto do sol
  float calm = mix(0.18, 1.0, smoothstep(-0.55 * uAspect, 0.25 * uAspect, p.x));
  vAlpha = twinkle * (0.3 + 0.7 * vNearSun) * mix(calm, 1.0, k);
  vAlpha *= 1.0 - k * 0.4;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p.xy, 0.0, 1.0);
  gl_PointSize = uSize * (0.6 + aSeed * 1.1) * (1.15 + position.z * 0.55);
}
