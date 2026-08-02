// Mirror folding: abs() plus a small rotation, five passes deep. One drifting
// stripe field comes back as an interlocking lattice of its own reflections,
// with the fold seams glowing where the mirrors meet.

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float t = iTime * 0.22 + uSeed;
  vec2 p = uv * 1.35;
  float seams = 0.0;
  float w = 1.0;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    p = abs(p) - vec2(0.46 + 0.14 * sin(t + fi * 0.8), 0.34 + 0.12 * cos(t * 1.3 + fi));
    p *= rot(0.38 + 0.1 * fi + t * 0.6);
    seams += w * exp(-min(abs(p.x), abs(p.y)) * 16.0);
    w *= 0.78;
  }

  float stripes = smoothstep(0.32, 0.5, abs(fract(p.x * 2.4 + iTime * 0.4) - 0.5));
  float field = smoothstep(0.0, 1.4, seams);

  vec3 col = mix(uColBg, uColInk, 0.4 + 0.6 * field);
  col = mix(col, uColDim * 0.85, stripes * 0.5);
  col = mix(col, uColSignal, field * (0.35 + 0.65 * stripes));
  col = mix(col, uColAccent, smoothstep(1.05, 1.9, seams) * 0.85);
  col = mix(col, uColPaper, smoothstep(1.75, 2.4, seams));

  fragColor = vec4(col, 1.0);
}
