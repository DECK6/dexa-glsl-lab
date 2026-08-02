// Seeded metaballs rise and fall inside a tapered glass vessel. Their
// overlapping scalar fields merge into slow, rounded convective masses.

float fl10Hash(float p) {
  return fract(sin(p * 127.1 + uSeed * 61.9) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.58 + uSeed * 0.51;
  float field = 0.0;
  float heat = 0.0;

  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float phase = t * (0.52 + fl10Hash(fi + 1.0) * 0.38) + fl10Hash(fi + 2.0) * 6.283;
    float radius = 0.085 + fl10Hash(fi + 3.0) * 0.085;
    vec2 center = vec2(
      sin(phase * 0.67 + fi) * (0.18 + fl10Hash(fi + 4.0) * 0.14),
      sin(phase) * (0.62 + fl10Hash(fi + 5.0) * 0.14)
    );
    center.x += sin(phase * 1.73 + uSeed) * 0.07;
    vec2 d = uv - center;
    float contribution = radius * radius / (dot(d, d) + 0.006);
    field += contribution;
    heat += exp(-dot(d, d) / (radius * radius)) * (0.55 + 0.45 * cos(phase));
  }

  float glassWidth = 0.48 - abs(uv.y) * 0.075;
  float glassSide = 1.0 - smoothstep(glassWidth, glassWidth + 0.025, abs(uv.x));
  float glassHeight = 1.0 - smoothstep(0.88, 0.94, abs(uv.y));
  float glass = glassSide * glassHeight;
  float blob = smoothstep(0.82, 1.12, field) * glass;
  float core = smoothstep(1.35, 2.25, field) * glass;
  float edge = exp(-abs(field - 0.98) * 8.0) * glass;
  float vesselEdge = exp(-abs(abs(uv.x) - glassWidth) * 70.0) * glassHeight;

  vec3 col = mix(uColBg, uColInk, glass * 0.25 + field * glass * 0.035);
  col = mix(col, uColSignal, blob * 0.72);
  col = mix(col, uColAccent, core * (0.45 + heat * 0.12));
  col += uColPaper * (edge * 0.48 + vesselEdge * 0.30);
  fragColor = vec4(col, 1.0);
}
