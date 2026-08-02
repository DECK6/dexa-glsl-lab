// Turbulence stacks |signed noise|, so the field creases where plain fbm would
// stay smooth. Read as an ink density it bleeds like a wash, and a narrow band
// just past the edge stays darker — the wet rim a loaded brush leaves behind.

float hash21(vec2 p) {
  p = fract(p * vec2(281.77, 173.19) + uSeed * 0.17);
  p += dot(p, p + 39.53);
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

float turbulence(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    sum += abs(vnoise(p) * 2.0 - 1.0) * amp;
    p = p * 2.07 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 2.2;
  vec2 drift = vec2(iTime * 0.018, -iTime * 0.012);

  float t1 = turbulence(uv + drift);
  float t2 = turbulence(uv * 0.55 - drift * 0.8 + 5.0);
  float wash = t1 * 0.75 + t2 * 0.55 + 0.05 * sin(iTime * 0.5);

  float ink = smoothstep(0.60, 0.28, wash);
  float rim = smoothstep(0.72, 0.60, wash) - smoothstep(0.60, 0.50, wash);
  float fiber = vnoise(uv * 55.0) * 0.10;
  float halo = smoothstep(0.10, 0.0, abs(wash - 0.78));

  vec3 col = mix(uColPaper * (0.93 + fiber), uColInk, ink);
  col = mix(col, uColBg, rim * 0.75);
  col += uColSignal * halo * 0.22;
  col += uColAccent * pow(ink, 4.0) * 0.25;
  fragColor = vec4(col, 1.0);
}
