// Leaf venation: three Voronoi border networks at nested scales share one
// stretched, curved domain, with a growth pulse travelling from base to tip.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000199) * 29.6;
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float veins(vec2 p, float width) {
  vec2 base = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      float d = length(g + hash22(base + g) - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return smoothstep(width, width * 0.15, d2 - d1);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

  vec2 q = uv * vec2(2.6, 1.1);
  q.x += 0.55 * sin(uv.y * 1.6 + iTime * 0.12);
  q.y -= iTime * 0.06;

  float midrib = smoothstep(0.045, 0.004, abs(q.x));
  float v1 = veins(q * 1.6, 0.22);
  float v2 = veins(q * 3.7 + 11.0, 0.15);
  float v3 = veins(q * 8.1 + 27.0, 0.10);
  float net = max(midrib, max(v1, max(v2 * 0.8, v3 * 0.55)));

  float travel = smoothstep(0.45, 0.0, abs(fract(iTime * 0.20) * 2.4 - 1.2 - uv.y));

  vec3 col = mix(uColBg, uColInk, 0.55 + 0.45 * v1);
  col = mix(col, uColDim * 0.6, v3 * 0.7);
  col = mix(col, uColPaper * 0.85, net);
  col = mix(col, uColSignal, net * (0.25 + 0.35 * v1));
  col += uColAccent * net * travel * 1.2;

  fragColor = vec4(col, 1.0);
}
