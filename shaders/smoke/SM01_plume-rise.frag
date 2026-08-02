// A turbulent plume climbing out of a hot throat: fbm advected upward through a
// domain warp, clipped to a column that widens and thins as it rises.

float hash21(vec2 p) {
  p = fract(p * vec2(127.11, 311.7) + uSeed * 0.31);
  p += dot(p, p + 34.53);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    value += amp * vnoise(p);
    p = p * 2.05 + vec2(13.7, 5.1);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;
  float h = clamp(uv.y * 0.5 + 0.5, 0.0, 1.0);

  // The sampling window scrolls down, so the smoke reads as rising.
  vec2 q = vec2(uv.x * 1.7, uv.y - t * 0.42);
  float warp = fbm(q * 1.3 + vec2(t * 0.09, 0.0));
  float dens = fbm(q + vec2(warp * 0.9 - 0.45, warp * 0.6));

  float sway = sin(uv.y * 2.1 + t * 0.85) * 0.16 * h;
  float offset = uv.x - sway;
  float width = 0.14 + h * 0.62;
  float column = exp(-offset * offset / (width * width) * 1.6);

  float smoke = clamp((dens - 0.30) * 2.6, 0.0, 1.0) * column * mix(1.15, 0.45, h);

  vec3 col = uColBg;
  col = mix(col, uColDim, smoothstep(0.04, 0.5, smoke));
  col = mix(col, uColPaper, smoothstep(0.5, 1.0, smoke) * 0.85);

  // Throat: cyan where the gas is still fast, orange right at the source.
  float throat = exp(-offset * offset * 16.0) * exp(-(uv.y + 0.8) * (uv.y + 0.8) * 5.0);
  col += uColSignal * throat * (0.55 + 0.35 * sin(t * 2.2)) * 1.4;
  col += uColAccent * throat * throat * 1.2;

  fragColor = vec4(col, 1.0);
}
