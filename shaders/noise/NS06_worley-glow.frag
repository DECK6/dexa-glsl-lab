// Worley F1/F2 over a drifting grid of orbiting seeds. F2-F1 collapses to zero
// exactly on the boundary between two cells, so tracking that gap draws the
// entire cell web in one pass — no edge detection needed.

vec2 hash22(vec2 p) {
  vec3 a = fract(p.xyx * vec3(163.31, 271.09, 89.53) + uSeed * 0.29);
  a += dot(a, a.yzx + 37.77);
  return fract(vec2(a.x * a.z, a.y * a.x));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 g = uv * 3.6 + vec2(iTime * 0.05, iTime * 0.03);
  vec2 cell = floor(g);
  vec2 f = fract(g);

  float f1 = 9.0;
  float f2 = 9.0;
  vec2 nearest = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(cell + o);
      vec2 pt = o + 0.5 + 0.4 * sin(iTime * (0.35 + h.y * 0.5) + h * 6.2831);
      float d = length(f - pt);
      if (d < f1) {
        f2 = f1;
        f1 = d;
        nearest = h;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }

  float gap = f2 - f1;
  float web = exp(-gap * 6.5);
  float wire = smoothstep(0.045, 0.0, gap);
  float body = smoothstep(1.1, 0.05, f1);

  vec3 col = mix(uColBg, uColInk, body * (0.35 + 0.65 * nearest.x));
  col += uColSignal * web * 0.9;
  col += uColAccent * smoothstep(0.16, 0.0, f1) * (0.5 + 0.5 * sin(iTime * 1.6 + nearest.y * 6.28));
  col = mix(col, uColPaper, wire * 0.85);
  fragColor = vec4(col, 1.0);
}
