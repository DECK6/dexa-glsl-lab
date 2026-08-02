// Contour linework only — no hypsometric fill — over a slowly drifting fbm
// height field. Every fourth level is promoted to a major contour, and a scan
// bar sweeping up the frame re-lights whichever lines it is crossing.

float hash21(vec2 p) {
  p = fract(p * vec2(311.7, 191.999) + uSeed * 0.43);
  p += dot(p, p + 17.31);
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
    p = p * 2.04 + vec2(9.1, 3.3);
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y * 2.6;
  float h = fbm(uv + vec2(iTime * 0.030, iTime * 0.012));

  float lev = h * 16.0;
  float edge = abs(fract(lev) - 0.5) * 2.0;
  float line = smoothstep(0.84, 1.0, edge);
  float major = step(mod(floor(lev), 4.0), 0.5);

  float sy = fragCoord.y / iResolution.y;
  float bar = fract(iTime * 0.2);
  float band = exp(-abs(sy - bar) * 22.0);
  float lead = smoothstep(0.006, 0.0, abs(sy - bar));
  float raster = 0.88 + 0.12 * sin(fragCoord.y * 3.1416);

  vec3 col = mix(uColBg, uColInk, 0.25 + 0.5 * h);
  col += uColSignal * line * (0.35 + 0.5 * major) * raster;
  col += uColPaper * line * major * 0.30;
  col += uColAccent * line * band * 2.2;
  col += uColAccent * lead * 0.55;
  col += uColSignal * band * 0.08;
  fragColor = vec4(col, 1.0);
}
