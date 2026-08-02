// Kali folding — p = |p| / dot(p, p) - c — run for thirteen levels. Two separate
// accumulators pick up the folds that land near each axis, so warp and weft
// threads cross into a weave that re-ties itself as c walks a small ellipse.

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y * 1.15;
  uv = rot(iTime * 0.06) * uv;

  float t = iTime * 0.13 + uSeed * 3.1415927;
  vec2 c = vec2(0.76 + 0.13 * sin(t), 0.84 + 0.11 * cos(t * 0.83));

  vec2 p = uv;
  float warp = 0.0;
  float weft = 0.0;
  float amp = 1.0;
  for (int i = 0; i < 13; i++) {
    p = abs(p) / max(dot(p, p), 1e-4) - c;
    warp += amp * (exp(-12.0 * abs(p.x)) + 0.22 * exp(-2.0 * abs(p.x)));
    weft += amp * (exp(-12.0 * abs(p.y)) + 0.22 * exp(-2.0 * abs(p.y)));
    amp *= 0.88;
  }
  warp = smoothstep(0.32, 0.86, warp / (1.0 + warp));
  weft = smoothstep(0.32, 0.86, weft / (1.0 + weft));

  vec3 col = mix(uColBg, uColInk, 0.62);
  col = mix(col, uColSignal * 0.82, warp * 0.78);
  col = mix(col, uColAccent * 0.8, weft * 0.68);
  col = mix(col, uColPaper, warp * weft * 0.58);

  fragColor = vec4(col, 1.0);
}
