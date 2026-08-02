// Two diamond lattices on the |x|+|y| metric, drifting along opposite diagonals
// at different scales. Where they overlap the interference never settles.

float diamond(vec2 p, float size) {
  return smoothstep(0.05, -0.03, abs(p.x) + abs(p.y) - size);
}

float layer(vec2 uv, float cells, vec2 drift, float size) {
  vec2 f = fract(uv * cells + drift) - 0.5;
  return diamond(f, size);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float breathe = 0.30 + 0.10 * sin(iTime * 0.6 + uSeed * 6.0);

  vec2 driftA = vec2(iTime * 0.30, iTime * 0.30);
  vec2 driftB = vec2(-iTime * 0.22, iTime * 0.22) + uSeed * 3.0;

  float a = layer(uv, 5.0, driftA, breathe);
  float b = layer(uv, 8.0, driftB, breathe * 0.8);

  // Slightly fatter copies minus the originals leave a wireframe echo.
  float ea = layer(uv, 5.0, driftA, breathe + 0.10) - a;
  float eb = layer(uv, 8.0, driftB, breathe * 0.8 + 0.08) - b;

  vec3 col = mix(uColBg, uColInk, 0.28);
  col = mix(col, uColSignal, a * 0.65);
  col += uColAccent * b * 0.45;
  col += uColPaper * max(ea, 0.0) * 0.35;
  col += uColSignal * max(eb, 0.0) * 0.3;
  col = mix(col, uColPaper, a * b * 0.7);

  fragColor = vec4(col, 1.0);
}
