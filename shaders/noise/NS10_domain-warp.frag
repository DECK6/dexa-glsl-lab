// Two-stage domain warp: an fbm of a point that was already displaced by an
// fbm of a displaced point. Each pass folds the field into itself, producing
// the filament structure a single fbm can never reach at any octave count.

float hash21(vec2 p) {
  p = fract(p * vec2(233.53, 107.91) + uSeed * 0.27);
  p += dot(p, p + 43.19);
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
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.06 + vec2(4.3, 6.9);
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 1.8 + uSeed * 0.13;
  float t = iTime * 0.07;

  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv + 3.4 * q + vec2(1.7, 9.2) + t * 1.6),
                fbm(uv + 3.4 * q + vec2(8.3, 2.8) - t * 1.2));
  float f = fbm(uv + 3.6 * r);

  vec3 col = mix(uColBg, uColInk, clamp(f * 2.0, 0.0, 1.0));
  col = mix(col, uColSignal * 0.9, clamp(length(q) * 1.1, 0.0, 1.0) * 0.65);
  col = mix(col, uColAccent, clamp(r.x * r.x * 2.4, 0.0, 1.0) * 0.55);
  col = mix(col, uColPaper, smoothstep(0.62, 0.95, f) * 0.75);
  col *= 0.5 + 1.1 * f;
  fragColor = vec4(col, 1.0);
}
