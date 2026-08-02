// Two cloud decks sliding past each other. The drift velocity flips sign across
// the midline, and the interface rolls up into billows the way a shear layer does.

float hash21(vec2 p) {
  p = fract(p * vec2(93.71, 187.13) + uSeed * 0.61);
  p += dot(p, p + 51.31);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    value += amp * vnoise(p);
    p = p * 2.03 + vec2(23.1, 8.9);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;

  float shear = tanh(uv.y * 3.2);
  float roll = sin(uv.x * 3.6 - t * 0.8 + uSeed) * exp(-uv.y * uv.y * 7.0) * 0.35;

  vec2 q = vec2(uv.x * 1.4 - shear * t * 0.55, (uv.y + roll) * 1.9);
  float warp = fbm(q * 1.6 + vec2(0.0, t * 0.07));
  float dens = fbm(q + warp * 0.7);

  float deck = smoothstep(0.26, 0.72, dens);
  vec3 tone = mix(uColDim, uColPaper, smoothstep(-0.5, 0.6, uv.y + roll));
  vec3 col = mix(uColBg, tone, deck * 0.95);

  // The tear line between the decks catches light on its rolled-up crests.
  float lip = uv.y + roll * 1.2;
  float iface = exp(-lip * lip * 9.0);
  col = mix(col, uColSignal, iface * deck * 0.5);
  col += uColAccent * iface * smoothstep(0.62, 0.86, dens) * 0.5;

  fragColor = vec4(col, 1.0);
}
