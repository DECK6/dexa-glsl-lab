// Mandelbrot orbits scored against three moving traps — a rotating cross, a
// breathing ring and a wandering point — instead of their escape count, so the
// set draws itself as neon filaments laid over the usual silhouette.

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 c = uv * 1.35 + vec2(-0.55, 0.0);

  mat2 R = rot(iTime * 0.28 + uSeed);
  float radius = 0.62 + 0.22 * sin(iTime * 0.45);
  vec2 dot0 = 0.85 * vec2(cos(iTime * 0.37), sin(iTime * 0.29));

  vec2 z = vec2(0.0);
  float cross = 1e9;
  float ring = 1e9;
  float spot = 1e9;
  for (int i = 0; i < 72; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    vec2 q = R * z;
    cross = min(cross, min(abs(q.x), abs(q.y)));
    ring = min(ring, abs(length(z) - radius));
    spot = min(spot, length(z - dot0));
    if (dot(z, z) > 36.0) break;
  }

  vec3 col = mix(uColBg, uColInk, 0.65);
  col += uColSignal * (exp(-cross * 34.0) * 0.95 + exp(-cross * 5.0) * 0.14);
  col += uColAccent * (exp(-ring * 26.0) * 0.85 + exp(-ring * 4.0) * 0.10);
  col += uColPaper * exp(-spot * 22.0) * 0.75;
  col += uColDim * exp(-cross * 1.5) * 0.10;

  fragColor = vec4(col, 1.0);
}
