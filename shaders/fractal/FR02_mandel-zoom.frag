// A cyclic dive into the Mandelbrot boundary near a Misiurewicz point. The view
// scale breathes on a cosine so the zoom loops forever, and the escape bands
// drift against the zoom so the picture never sits still.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float k = 0.5 - 0.5 * cos(iTime * 0.22);
  float scale = 1.4 * exp(-7.0 * k);
  vec2 sway = vec2(sin(iTime * 0.09 + uSeed), cos(iTime * 0.07));
  vec2 c = vec2(-0.74364, 0.13182) + scale * (uv + 0.12 * sway);

  vec2 z = vec2(0.0);
  float iter = 0.0;
  for (int i = 0; i < 190; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 256.0) break;
    iter += 1.0;
  }

  float esc = step(iter, 189.5);
  float sm = iter + 1.0 - log2(0.5 * log2(max(dot(z, z), 4.0)));
  float g = sm / 190.0;
  float band = 0.5 + 0.5 * cos(6.2831853 * (sqrt(sm) * 0.75 - iTime * 0.30));

  vec3 col = mix(uColBg, uColInk, 0.9);
  col = mix(col, uColSignal * (0.25 + 0.75 * band), esc * smoothstep(0.0, 0.22, g));
  col = mix(col, uColAccent, esc * smoothstep(0.20, 0.62, g) * (0.30 + 0.70 * band));
  col = mix(col, uColPaper, esc * smoothstep(0.62, 0.95, g) * 0.75);
  col = mix(col, uColInk * 0.45, 1.0 - esc);

  fragColor = vec4(col, 1.0);
}
