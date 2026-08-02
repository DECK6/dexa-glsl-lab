// Vertical hold gone: the whole picture rolls and wraps, and the blanking bar
// at the seam crushes and smears every row it passes over.

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

vec3 testcard(vec2 p) {
  float sel = fract(floor((p.x + 1.0) * 3.0) * 0.37 + 0.11);
  vec3 col = mix(uColInk, uColBg, 0.4);
  col = mix(col, uColSignal * 0.8, step(0.33, sel));
  col = mix(col, uColAccent * 0.9, step(0.66, sel));
  col = mix(col, uColDim, step(0.9, sel));
  col = mix(col, uColPaper, smoothstep(0.05, 0.0, abs(length(p) - 0.45)));
  col = mix(col, uColPaper * (p.x * 0.5 + 0.5), step(abs(p.y + 0.78), 0.12));
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // roll speed breathes but never reverses
  float roll = iTime * 0.30 + 0.24 * sin(iTime * 0.9) + uSeed * 0.21;
  float y01 = fract((uv.y + 1.0) * 0.5 + roll);
  float seam = min(y01, 1.0 - y01);

  float wob = hash11(floor(uv.y * 130.0) + mod(floor(iTime * 22.0), 2048.0) + uSeed) - 0.5;
  float x = uv.x + wob * 0.05 + exp(-seam * 26.0) * 0.35 * sin(iTime * 5.0);

  vec3 col = testcard(vec2(x, y01 * 2.0 - 1.0));

  float bar = exp(-seam * 40.0);
  col = mix(col, uColBg * 0.15, bar * 0.9);
  col += uColPaper * bar * hash11(floor(uv.x * 240.0) + mod(floor(iTime * 45.0), 2048.0)) * 0.7;

  col *= 0.8 + 0.2 * step(0.5, fract(uv.y * 150.0));
  fragColor = vec4(col, 1.0);
}
