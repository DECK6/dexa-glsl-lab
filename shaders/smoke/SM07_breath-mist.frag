// Breath in cold air: four puffs on staggered life cycles, each leaving the
// mouth, ballooning as it slows, thinning out, and being replaced by the next.

float hash21(vec2 p) {
  p = fract(p * vec2(139.47, 201.83) + uSeed * 0.29);
  p += dot(p, p + 33.41);
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
    p = p * 2.05 + vec2(15.7, 6.9);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;
  vec2 mouth = vec2(-0.62, -0.05);

  float mist = 0.0;
  float warm = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float ph = fract(t * 0.3 + fi * 0.25 + uSeed * 0.07);
    vec2 c = mouth + vec2(1.35 * ph, 0.32 * ph * ph + sin(ph * 4.0 + fi) * 0.06);
    float rad = 0.07 + 0.52 * ph;

    vec2 d = (uv - c) / rad;
    float rr = length(d * vec2(1.0, 1.18));
    float puff = smoothstep(1.0, 0.15, rr);
    float tex = fbm(d * 4.5 + vec2(fi * 7.3, -t * 0.6));
    float life = smoothstep(0.0, 0.1, ph) * smoothstep(1.0, 0.45, ph);

    mist += puff * (0.35 + 1.2 * tex) * life * mix(1.0, 0.45, ph);
    warm += puff * life * (1.0 - ph) * 0.6;
  }

  vec3 col = mix(uColBg, uColInk, smoothstep(-1.0, 0.9, uv.y));
  col = mix(col, uColDim, smoothstep(0.06, 0.5, mist));
  col = mix(col, uColPaper, smoothstep(0.5, 1.1, mist) * 0.9);
  col = mix(col, uColSignal, clamp(warm, 0.0, 1.0) * 0.35);

  vec2 lip = uv - mouth;
  col += uColAccent * exp(-dot(lip, lip) * 90.0) * 0.7;

  fragColor = vec4(col, 1.0);
}
