// Ridged multifractal: folding each octave through 1-|2n-1| turns smooth hills
// into creases, and weighting the next octave by the current one keeps the fine
// detail on the crests. Contour bands ride the elevation that comes out.

float hash21(vec2 p) {
  p = fract(p * vec2(211.31, 97.17) + uSeed * 0.19);
  p += dot(p, p + 27.71);
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

float ridged(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  float prev = 1.0;
  for (int i = 0; i < 6; i++) {
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    n *= n;
    sum += n * amp * prev;
    prev = clamp(n * 1.7, 0.0, 1.0);
    p = p * 2.05 + vec2(3.7, -1.9);
    amp *= 0.5;
  }
  return sum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 2.3;
  vec2 flow = vec2(iTime * 0.035, iTime * 0.018);
  float h = clamp(ridged(uv + flow) * 1.35, 0.0, 1.0);

  float lev = h * 11.0 - iTime * 0.5;
  float edge = abs(fract(lev) - 0.5) * 2.0;
  float line = smoothstep(0.82, 1.0, edge);
  float crest = smoothstep(0.50, 0.80, h);

  vec3 col = mix(uColBg, uColInk, smoothstep(0.05, 0.40, h));
  col = mix(col, uColDim, smoothstep(0.30, 0.65, h) * 0.65);
  col = mix(col, uColSignal * 0.85, crest * 0.75);
  col += uColAccent * smoothstep(0.78, 0.98, h) * 1.2;
  col += uColPaper * line * (0.25 + 0.45 * crest);
  fragColor = vec4(col, 1.0);
}
