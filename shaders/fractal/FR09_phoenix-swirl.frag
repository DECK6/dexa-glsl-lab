// The Phoenix Julia set — z' = z² + c + p·z_prev, a quadratic with one step of
// memory — viewed through a radial swirl that twists hardest at the centre and
// relaxes toward the rim, folding the two arms into a slow whirlpool.

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y * 1.35;

  float r = length(uv);
  float swirl = 1.35 * sin(iTime * 0.23 + uSeed) / (1.0 + 2.2 * r * r);
  uv = rot(swirl + iTime * 0.07) * uv;

  vec2 z = vec2(uv.y, uv.x);
  vec2 prev = vec2(0.0);
  float cr = 0.5667 + 0.020 * sin(iTime * 0.31);
  float pr = -0.5 + 0.050 * cos(iTime * 0.19);

  float iter = 0.0;
  float trap = 1e9;
  for (int i = 0; i < 90; i++) {
    vec2 next = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + vec2(cr, 0.0) + pr * prev;
    prev = z;
    z = next;
    trap = min(trap, 0.6 * abs(z.x) + 0.4 * abs(z.y));
    if (dot(z, z) > 64.0) break;
    iter += 1.0;
  }

  float inside = step(89.5, iter);
  float sm = (iter + 1.0 - log2(0.5 * log2(max(dot(z, z), 4.0)))) / 90.0;
  float arms = 0.5 + 0.5 * cos(atan(uv.y, uv.x + 1e-5) * 3.0 + sqrt(sm) * 20.0 - iTime * 0.9);

  vec3 col = mix(uColBg, uColInk, 0.8);
  col = mix(col, uColSignal * (0.35 + 0.65 * arms), (1.0 - inside) * smoothstep(0.0, 0.28, sm));
  col = mix(col, uColAccent, (1.0 - inside) * smoothstep(0.30, 0.80, sm) * (0.40 + 0.60 * arms));
  col = mix(col, uColDim * 0.45, inside);
  col += uColPaper * inside * exp(-trap * 4.0) * 0.95;

  fragColor = vec4(col, 1.0);
}
