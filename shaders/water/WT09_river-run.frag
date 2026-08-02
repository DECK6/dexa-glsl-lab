// Surface of a running river. The centre lane pulls ahead of the banks and
// the shear stretches the noise into long streaks with glints riding them.

float hash21(vec2 p) {
  p = fract(p * vec2(311.7, 191.999) + uSeed);
  p += dot(p, p + 41.13);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p = p * 2.05 + 3.7;
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float lane = exp(-uv.y * uv.y * 2.0);
  vec2 p = vec2(uv.x - iTime * 0.6 - lane * 0.55 * sin(iTime * 0.35), uv.y * 2.6);

  float warp = fbm(p * 1.2 + vec2(iTime * 0.08, 0.0));
  vec2 q = p + vec2(warp * 0.7, warp * 0.3);

  // sampling the noise anisotropically turns it into flow lines
  float streak = fbm(vec2(q.x * 0.85, q.y * 4.2));
  float detail = fbm(vec2(q.x * 2.4 - iTime * 0.25, q.y * 9.0));
  float ridge = abs(sin(streak * 8.0 + detail * 3.0 + q.x * 1.4));

  float sheen = 1.0 - ridge;
  float glint = smoothstep(0.78, 0.99, sheen) * (0.35 + lane);

  vec3 col = mix(uColBg, uColInk, 0.28 + 0.5 * smoothstep(0.15, 0.85, streak));
  col = mix(col, uColSignal, smoothstep(0.35, 0.92, sheen) * 0.7);
  col = mix(col, uColPaper, clamp(glint, 0.0, 1.0));
  col += uColAccent * glint * glint * lane * 0.8;
  col = mix(col, uColBg, smoothstep(0.55, 1.05, abs(uv.y)) * 0.4);

  fragColor = vec4(col, 1.0);
}
