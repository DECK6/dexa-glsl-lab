// A field of tiny grid lights breathes out of phase without breaking its calm.

float gridHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 19.3) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 gridUv = uv * 5.0 + vec2(uSeed * 0.37, uSeed * 0.23);
  vec2 cell = floor(gridUv);
  vec2 local = fract(gridUv) - 0.5;
  float randomPhase = gridHash(cell);
  float breath = 0.5 + 0.5 * sin(iTime * 0.62 + randomPhase * 6.2831);
  float radius = 0.075 + breath * 0.038;
  float d = length(local);

  float core = 1.0 - smoothstep(radius - 0.018, radius + 0.018, d);
  float glow = exp(-d * 7.5) * (0.18 + breath * 0.22);
  float rare = smoothstep(0.82, 0.96, randomPhase);
  float field = 0.11 + exp(-length(uv) * 1.4) * 0.08;

  vec3 col = mix(uColBg, uColDim, field);
  col += uColSignal * glow * (1.0 - rare * 0.45);
  col += uColAccent * glow * rare * 0.8;
  col = mix(col, uColPaper, core * (0.55 + breath * 0.35));

  fragColor = vec4(col, 1.0);
}
