// Five-octave value-noise fbm, drifting on two axes and remapped
// through the palette: bg → ink → signal, with accent on the crests.

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345) + uSeed);
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
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
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * valueNoise(p);
    p = p * 2.02 + vec2(11.3, 7.7);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 3.0;

  vec2 drift = vec2(iTime * 0.08, -iTime * 0.05);
  float base = fbm(uv + drift);
  float warp = fbm(uv * 1.7 - drift * 1.4 + base);

  float field = mix(base, warp, 0.5);
  vec3 col = mix(uColBg, uColInk, smoothstep(0.2, 0.5, field));
  col = mix(col, uColSignal, smoothstep(0.5, 0.78, field));
  col = mix(col, uColAccent, smoothstep(0.82, 0.95, warp * base * 1.6));

  fragColor = vec4(col, 1.0);
}
