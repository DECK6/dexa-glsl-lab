// A de Bruijn pentagrid: five line families 72° apart cut the plane into a
// quasi-periodic rhomb field. Sliding the offsets keeps the cells reshuffling.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 4.2;

  float index = 0.0;
  float key = 0.0;
  float seam = 1.0;

  for (int i = 0; i < 5; i++) {
    float a = float(i) * 1.2566371;
    vec2 dir = vec2(cos(a), sin(a));
    float s = dot(p, dir) + 0.35 * sin(iTime * 0.4 + float(i) * 1.7) + uSeed * 0.13;
    float n = floor(s);
    index += n;
    key += n * (1.0 + float(i) * 0.618);
    seam = min(seam, 0.5 - abs(s - n - 0.5));
  }

  float kind = mod(index, 5.0) / 4.0;
  float glow = 0.5 + 0.5 * sin(iTime * 1.3 + key * 1.27);

  vec3 cellCol = mix(uColDim * 0.55, uColSignal, kind);
  cellCol = mix(cellCol, uColAccent, smoothstep(0.55, 1.0, glow) * 0.75);

  vec3 col = mix(uColBg, cellCol, 0.3 + 0.45 * glow);
  col = mix(col, uColPaper, smoothstep(0.05, 0.005, seam) * 0.85);
  col += uColSignal * smoothstep(0.14, 0.0, seam) * 0.15;

  fragColor = vec4(col, 1.0);
}
