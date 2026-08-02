// Low-lying fog rolling sideways: four stacked ribbons, each with its own drift
// speed and undulating top edge, so the bank keeps shearing against itself.

float hash21(vec2 p) {
  p = fract(p * vec2(211.13, 97.31) + uSeed * 0.53);
  p += dot(p, p + 41.17);
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
  for (int i = 0; i < 5; i++) {
    value += amp * vnoise(p);
    p = p * 2.11 + vec2(7.3, 19.7);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;

  vec3 col = mix(uColBg, uColInk, smoothstep(1.0, -0.3, uv.y));
  float crest = 0.0;

  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float speed = 0.22 + fi * 0.16;
    float edge = -0.78 + fi * 0.36
               + 0.30 * fbm(vec2(uv.x * 1.25 + t * speed + fi * 11.7, fi * 3.7));
    float body = smoothstep(edge, edge - 0.42, uv.y);
    float tex = fbm(vec2(uv.x * 2.3 + t * speed * 1.7 + fi * 5.1,
                         uv.y * 3.4 - t * 0.2 + fi * 2.3));
    float dens = clamp(body * (0.35 + 1.1 * tex), 0.0, 1.0);

    // Nearer ribbons sit lower and read brighter.
    vec3 tone = mix(uColDim, uColPaper, 0.15 + fi * 0.22);
    col = mix(col, tone, dens * (0.42 + fi * 0.15));
    crest += body * (1.0 - body) * dens * 3.4;
  }

  col += uColSignal * clamp(crest, 0.0, 1.0) * 0.5;
  fragColor = vec4(col, 1.0);
}
