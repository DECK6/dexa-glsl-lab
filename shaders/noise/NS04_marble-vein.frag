// Marble is a sine grain whose phase gets pushed around by fbm. Warping the
// fbm input first makes the grain twist instead of merely sliding, and the
// veins are the zero crossings of that displaced sine.

float hash21(vec2 p) {
  p = fract(p * vec2(367.11, 129.73) + uSeed * 0.23);
  p += dot(p, p + 31.41);
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
    p = p * 2.03 + vec2(5.1, 1.7);
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 2.0;
  float t = iTime * 0.06;

  vec2 warp = vec2(fbm(uv * 1.2 + t), fbm(uv * 1.2 + vec2(7.3, 2.1) - t));
  float turb = fbm(uv * 2.1 + warp * 1.6);

  float g1 = sin((uv.x * 0.9 + uv.y * 0.5) * 5.5 + turb * 9.0 + iTime * 0.20);
  float g2 = sin((uv.y * 1.2 - uv.x * 0.4) * 12.0 + turb * 6.0 - iTime * 0.14);
  float vein = pow(1.0 - abs(g1), 7.0);
  float hair = pow(1.0 - abs(g2), 16.0);

  vec3 col = mix(uColBg, uColInk, 0.35 + 0.65 * turb);
  col = mix(col, uColDim, smoothstep(0.35, 0.85, turb) * 0.45);
  col = mix(col, uColPaper, clamp(vein * 1.15, 0.0, 1.0));
  col += uColSignal * hair * 0.75;
  col += uColAccent * pow(vein, 3.0) * 0.45;
  fragColor = vec4(col, 1.0);
}
