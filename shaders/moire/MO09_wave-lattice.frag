// Two hexagonal wave lattices double-exposed at a small relative twist — the
// twisted-bilayer trick. The difference of the two wave vectors is its own
// hex superlattice, and it grows as the twist angle closes.

float lattice(vec2 p, float k, float base, float phase) {
  float v = 0.0;
  for (int i = 0; i < 3; i++) {
    float a = base + float(i) * 1.0471976;
    v += sin(dot(p, vec2(cos(a), sin(a))) * k + phase);
  }
  return v / 3.0;
}

float superLattice(vec2 p, float k1, float k2, float a1, float a2) {
  float v = 0.0;
  for (int i = 0; i < 3; i++) {
    float t1 = a1 + float(i) * 1.0471976;
    float t2 = a2 + float(i) * 1.0471976;
    vec2 dk = vec2(cos(t1), sin(t1)) * k1 - vec2(cos(t2), sin(t2)) * k2;
    v += cos(dot(p, dk));
  }
  return v / 3.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float a1 = uSeed * 0.4 + iTime * 0.03;
  float a2 = a1 + 0.048 + 0.042 * sin(iTime * 0.17);
  float k1 = 140.0;
  float k2 = 144.0;

  float la = lattice(uv, k1, a1, iTime * 1.3);
  float lb = lattice(uv, k2, a2, -iTime * 1.3);
  float cells = superLattice(uv, k1, k2, a1, a2);

  float weave = smoothstep(-0.15, 0.7, la * lb * 3.0);
  float node = smoothstep(0.25, 0.98, cells);

  vec3 col = mix(uColBg, uColInk, 0.5);
  col = mix(col, uColDim, weave * 0.45);
  col = mix(col, uColSignal, weave * (0.2 + 0.8 * node));
  col = mix(col, uColPaper, weave * pow(node, 4.0) * 0.6);
  col += uColAccent * pow(node, 6.0) * 0.55;

  fragColor = vec4(col, 1.0);
}
