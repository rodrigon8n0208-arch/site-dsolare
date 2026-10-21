precision highp float;
uniform float uWarmth;
varying float vAlpha;
varying float vNearSun;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float glow = smoothstep(0.5, 0.0, length(c));
  glow *= glow;
  vec3 cool = vec3(0.72, 0.84, 1.0);
  vec3 warm = vec3(1.0, 0.78, 0.45);
  vec3 col = mix(cool, warm, clamp(uWarmth * 0.6 + vNearSun * 0.7, 0.0, 1.0));
  // saída pré-multiplicada: funciona igual sobre o céu opaco e sobre o canvas transparente do hero
  float a = glow * vAlpha;
  gl_FragColor = vec4(col * a, a);
}
