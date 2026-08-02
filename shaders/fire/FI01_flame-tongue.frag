// A single tongue of flame licking upward: advected fbm carves the
// silhouette, a taper pinches it to a tip, and the base runs white-hot.

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.31);
  p += dot(p, p + 34.11);
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
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(5.2, 1.3);
    a *= 0.5;
  }
  return v;
}

// dark → ember → orange → yellow → white core
vec3 fireRamp(float t) {
  vec3 c = mix(uColBg, uColInk, smoothstep(0.0, 0.12, t));
  c = mix(c, uColAccent * 0.45, smoothstep(0.08, 0.3, t));
  c = mix(c, uColAccent, smoothstep(0.28, 0.6, t));
  c = mix(c, mix(uColAccent, uColPaper, 0.62), smoothstep(0.6, 0.88, t));
  c = mix(c, uColPaper, smoothstep(0.9, 1.1, t));
  return c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float h = clamp((uv.y + 0.95) / 1.9, 0.0, 1.0);
  float sway = sin(uv.y * 2.1 + iTime * 1.6) * 0.2 * h * h;
  float x = uv.x - sway;

  float turb = fbm(vec2(x * 3.2, uv.y * 2.2 - iTime * 1.7));
  float width = (0.34 * pow(1.0 - h, 0.7) + 0.012) * (0.6 + 0.8 * turb);
  float body = 1.0 - abs(x) / max(width, 0.001);

  float heat = smoothstep(-0.2, 0.95, body) * (1.2 - h * 0.95);
  heat *= 0.9 + 0.18 * sin(iTime * 8.0 + turb * 7.0);

  vec3 col = fireRamp(heat);
  col += uColAccent * 0.22 * exp(-abs(x) * 3.4) * (1.0 - h) * (0.6 + 0.5 * turb);
  col += uColAccent * 0.14 * exp(-(uv.y + 1.0) * 3.0);
  col += uColDim * 0.16 * smoothstep(0.55, 0.95, turb) * smoothstep(0.55, 1.0, h);

  fragColor = vec4(col, 1.0);
}
