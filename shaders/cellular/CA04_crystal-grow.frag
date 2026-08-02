// Hex-faceted crystals nucleating on a lattice: every seed pushes its growth
// front outward on its own clock, holds, then dissolves and re-nucleates.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000167) * 44.3;
  p = vec2(dot(p, vec2(157.31, 113.77)), dot(p, vec2(271.9, 199.1)));
  return fract(sin(p) * 43758.5453);
}

// hexagonal norm — its isolines are flat-edged hexagons turned by `rot`
float facet(vec2 v, float rot) {
  float k = 6.2832 / 6.0;
  float a = atan(v.y, v.x + 1e-5) + rot;
  a = abs(mod(a + 0.5 * k, k) - 0.5 * k);
  return length(v) * cos(a);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 4.4;

  vec2 base = floor(uv);
  vec2 f = fract(uv);
  float best = 8.0;
  float tone = 0.0;
  float grown = 0.0;
  float raw = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 h = hash22(base + g);
      vec2 seed = g + 0.2 + 0.6 * h;
      float cycle = fract(iTime * 0.11 + h.y);
      float radius = 0.85 * smoothstep(0.0, 0.5, cycle) * (1.0 - smoothstep(0.82, 1.0, cycle));
      float d = facet(f - seed, 6.2832 * h.x + iTime * 0.05);
      if (d - radius < best) {
        best = d - radius;
        tone = h.x;
        grown = radius;
        raw = d;
      }
    }
  }

  float body = smoothstep(0.03, -0.03, best);
  float rim = smoothstep(0.07, 0.0, abs(best));
  float striae = 0.5 + 0.5 * sin(raw * 46.0 - iTime * 2.2);

  vec3 col = mix(uColBg, uColInk, 0.75);
  col = mix(col, mix(uColDim * 0.8, uColSignal * 0.45, tone), body * (0.55 + 0.45 * striae));
  col = mix(col, uColSignal, rim);
  col += uColAccent * rim * smoothstep(0.25, 0.7, grown) * 0.8;
  col += uColPaper * body * striae * 0.10;

  fragColor = vec4(col, 1.0);
}
