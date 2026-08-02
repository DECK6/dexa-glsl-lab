// Burning Ship: the Mandelbrot quadratic with both components folded to their
// absolute value each step, which snaps the smooth bulbs into hulls and masts.
// The frame drifts slowly along the main antenna and the bands crawl outward.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float scale = 0.155 + 0.030 * sin(iTime * 0.13);
  vec2 drift = vec2(0.42 * sin(iTime * 0.08 + uSeed), 0.30 * cos(iTime * 0.061));
  vec2 c = vec2(-1.7548, -0.0345) + scale * (uv + drift);

  vec2 z = vec2(0.0);
  float iter = 0.0;
  for (int i = 0; i < 150; i++) {
    z = abs(z);
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 256.0) break;
    iter += 1.0;
  }

  float esc = step(iter, 149.5);
  float sm = iter + 1.0 - log2(0.5 * log2(max(dot(z, z), 4.0)));
  float g = sm / 150.0;
  float band = 0.5 + 0.5 * cos(6.2831853 * (sqrt(sm) * 0.85 - iTime * 0.22));

  vec3 col = mix(uColBg, uColInk, 0.95);
  col = mix(col, uColAccent * (0.30 + 0.70 * band), esc * smoothstep(0.0, 0.26, g));
  col = mix(col, uColPaper, esc * smoothstep(0.30, 0.78, g) * 0.65);
  col = mix(col, uColSignal, esc * smoothstep(0.80, 1.0, g) * 0.85);
  col = mix(col, uColInk * 0.35, 1.0 - esc);

  fragColor = vec4(col, 1.0);
}
