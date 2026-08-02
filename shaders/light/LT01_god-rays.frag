// A bright slit near the upper edge spills a rotating fan of broken rays.
// Fine angular bands and broad haze make the opening feel volumetric.

float rayHash(float n) {
  return fract(sin(n * 91.713 + uSeed * 37.11) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 source = vec2(-0.18 + 0.18 * sin(iTime * 0.17 + uSeed), 0.94);
  vec2 q = uv - source;
  float radius = length(q);
  float angle = atan(q.x, -q.y) + 0.10 * sin(iTime * 0.24 + uSeed * 4.0);

  float fan = smoothstep(1.05, 0.72, abs(angle));
  float bands = 0.0;
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float centre = mix(-0.82, 0.82, (fi + 0.5) / 9.0);
    centre += (rayHash(fi) - 0.5) * 0.10;
    float width = mix(0.025, 0.085, rayHash(fi + 12.0));
    bands += exp(-pow((angle - centre) / width, 2.0));
  }

  float shafts = fan * bands * exp(-radius * 0.58);
  float haze = fan * exp(-radius * 0.82) * (0.20 + 0.08 * sin(angle * 17.0 - iTime));
  float slit = exp(-abs(q.y) * 170.0) * smoothstep(0.46, 0.04, abs(q.x));
  float dust = pow(0.5 + 0.5 * sin(radius * 31.0 - iTime * 1.3 + angle * 9.0), 12.0);

  vec3 col = mix(uColBg, uColInk, 0.34 + haze * 0.25);
  col += uColSignal * shafts * (0.38 + dust * 0.22);
  col += uColAccent * fan * bands * bands * 0.14;
  col += uColPaper * (slit * 1.3 + shafts * shafts * 0.18);
  fragColor = vec4(col, 1.0);
}
