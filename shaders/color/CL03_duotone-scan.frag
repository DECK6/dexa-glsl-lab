// One luminance field printed as two duotones — cyan on one side of a travelling
// split, orange on the other — with an inverted sliver trailing the seam.

float field(vec2 p) {
  float stripes = sin(p.x * 5.5 + sin(p.y * 2.6 + iTime * 0.5) * 1.6);
  float rings = sin(length(p * 2.1) * 5.0 - iTime * 1.2);
  return 0.5 + 0.26 * stripes + 0.22 * rings;
}

vec3 duotone(float v, vec3 lo, vec3 hi) {
  return mix(lo, hi, smoothstep(0.04, 0.96, clamp(v, 0.0, 1.0)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float v = field(uv);

  // the split is a diagonal that slides across and ripples as it goes
  float ripple = 0.11 * sin(uv.y * 3.4 + iTime * 1.3) + 0.05 * sin(uv.y * 8.0 - iTime * 2.1);
  float split = uv.x + uv.y * 0.35 - (sin(iTime * 0.42 + uSeed * 6.2831) * 0.9 + ripple);

  vec3 cold = duotone(v, uColBg, uColSignal);
  vec3 warm = duotone(v, uColInk, uColAccent);
  vec3 col = mix(cold, warm, smoothstep(-0.015, 0.015, split));

  // trailing sliver reads inverted, then a hard edge sits on the seam itself
  float sliver = smoothstep(0.14, 0.03, abs(split - 0.09));
  col = mix(col, duotone(1.0 - v, uColBg, uColPaper), sliver * 0.45);
  col = mix(col, uColPaper, smoothstep(0.028, 0.0, abs(split)));

  fragColor = vec4(col, 1.0);
}
