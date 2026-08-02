// Voronoi seeds carried by a slow flow field: cell interiors take their tone
// from the cell hash, the seams between them read as thin signal-lit borders.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000173) * 41.7;
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

vec2 flow(vec2 p, float t) {
  return 0.35 * vec2(sin(p.y * 1.3 + t), cos(p.x * 1.1 - t * 0.8));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 5.5;
  uv += flow(uv, iTime * 0.4);

  vec2 base = floor(uv);
  vec2 f = fract(uv);
  float d1 = 8.0;
  float d2 = 8.0;
  vec2 id = base;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 h = hash22(base + g);
      vec2 p = g + 0.5 + 0.42 * sin(iTime * 0.7 + 6.2832 * h);
      float d = length(p - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = base + g;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  float tone = hash22(id).x;
  float seam = smoothstep(0.02, 0.18, d2 - d1);

  vec3 col = mix(uColBg, uColInk, 0.5 + 0.5 * tone);
  col = mix(col, uColDim, 0.45 * tone * tone);
  col += uColPaper * 0.30 * smoothstep(0.34, 0.0, d1) * (0.3 + tone);
  col = mix(uColSignal, col, seam);
  col = mix(col, uColAccent, (1.0 - seam) * smoothstep(0.86, 0.93, tone));

  fragColor = vec4(col, 1.0);
}
