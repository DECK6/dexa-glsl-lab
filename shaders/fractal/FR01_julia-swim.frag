// A Julia set whose parameter c swims around a circle of radius 0.7885, so the
// filled set keeps breathing between one connected blob and scattered dust.
// Escape bands ring the outside; an orbit trap lights filaments on the inside.

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y * 1.45;

  float t = iTime * 0.17 + uSeed * 6.2831853;
  vec2 c = 0.7885 * vec2(cos(t), sin(t));

  vec2 z = uv;
  float iter = 0.0;
  float trap = 1e9;
  for (int i = 0; i < 96; i++) {
    z = cmul(z, z) + c;
    trap = min(trap, abs(z.y) + 0.35 * abs(z.x));
    if (dot(z, z) > 64.0) break;
    iter += 1.0;
  }

  float inside = step(95.5, iter);
  float sm = (iter + 1.0 - log2(0.5 * log2(max(dot(z, z), 4.0)))) / 96.0;
  float ring = 0.5 + 0.5 * cos(6.2831853 * (sqrt(sm) * 5.0 - iTime * 0.4));

  vec3 col = mix(uColBg, uColInk, 0.85);
  col = mix(col, uColSignal * (0.30 + 0.70 * ring), (1.0 - inside) * smoothstep(0.0, 0.30, sm));
  col = mix(col, uColAccent, (1.0 - inside) * smoothstep(0.32, 0.85, sm) * (0.35 + 0.65 * ring));
  col = mix(col, uColInk * 0.6, inside);
  col += uColPaper * inside * exp(-trap * 5.0) * 1.1;
  col += uColSignal * (1.0 - inside) * exp(-trap * 9.0) * 0.30;

  fragColor = vec4(col, 1.0);
}
