// Chroma channels torn apart: one graphic sampled at three offsets and retinted,
// so cyan leads and orange trails wherever the per-row jitter spikes.

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

float glyph(vec2 p) {
  float disc = smoothstep(0.42, 0.40, length(p - vec2(0.0, 0.26)));
  float hole = smoothstep(0.17, 0.15, length(p - vec2(0.0, 0.26)));
  float bar1 = step(abs(p.x), 0.55) * step(abs(p.y + 0.32), 0.09);
  float bar2 = step(abs(p.x), 0.36) * step(abs(p.y + 0.58), 0.07);
  return clamp(disc - hole + bar1 + bar2, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float row = floor(uv.y * 120.0);
  float clock = mod(floor(iTime * 14.0), 2048.0);
  float jitter = hash11(row * 0.71 + clock + uSeed * 17.0) - 0.5;

  float spread = 0.045 + 0.030 * sin(iTime * 1.7 + uSeed);
  spread += abs(jitter) * 0.18 * step(0.60, hash11(clock + uSeed * 3.0));

  vec2 o = vec2(spread, 0.0);
  float lead = glyph(uv + o);
  float mid = glyph(uv);
  float trail = glyph(uv - o + vec2(0.0, spread * 0.3));

  vec3 col = uColBg;
  col += uColSignal * lead * 0.95;
  col += uColAccent * trail * 0.95;
  col += uColPaper * mid * 0.55;

  // faint scan bed so the empty field never reads as flat background
  col += uColDim * 0.20 * step(0.5, fract(uv.y * 90.0));
  fragColor = vec4(col, 1.0);
}
