// A procedural grid seen through two travelling lenses. One pushes texels
// outward (minify), the other pulls them in (magnify), so the same lattice
// reads compressed and stretched at once.

vec2 bulge(vec2 p, vec2 c, float radius, float strength) {
  vec2 d = p - c;
  float r = length(d);
  float k = 1.0 - smoothstep(0.0, radius, r);
  return p + d * k * k * strength;
}

float grid(vec2 p, float w) {
  vec2 g = abs(fract(p) - 0.5);
  return smoothstep(0.5 - w, 0.5, max(g.x, g.y));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float t = iTime * 0.55 + uSeed;
  vec2 c1 = vec2(cos(t) * 0.62, sin(t * 1.3) * 0.5);
  vec2 c2 = vec2(sin(t * 0.8 + 2.1) * 0.7, cos(t * 0.6 + 1.0) * 0.45);

  vec2 w = uv;
  w = bulge(w, c1, 0.78, 0.9);
  w = bulge(w, c2, 0.55, -0.55);

  float cell = grid(w * 3.5, 0.09);
  float fine = grid(w * 10.5, 0.16);

  float lens1 = 1.0 - smoothstep(0.0, 0.78, length(uv - c1));
  float lens2 = 1.0 - smoothstep(0.0, 0.55, length(uv - c2));
  float rim = smoothstep(0.72, 0.78, length(uv - c1)) * (1.0 - smoothstep(0.78, 0.84, length(uv - c1)));

  vec3 col = mix(uColBg, uColInk, 0.45 + 0.55 * fine);
  col = mix(col, uColDim * 0.9, fine * 0.5);
  col = mix(col, uColSignal, cell * (0.4 + 0.6 * lens1));
  col = mix(col, uColPaper, cell * lens1 * lens1 * 0.75);
  col += uColAccent * lens2 * lens2 * (0.2 + 0.6 * cell);
  col += uColAccent * rim * 0.45;

  fragColor = vec4(col, 1.0);
}
