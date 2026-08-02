// Fish scales: staggered rows of overlapping discs. A wave runs along the body
// and each scale catches the light in turn as the crest passes over it.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // Body wave, so the whole sheet of scales undulates rather than sits flat.
  float body = 0.12 * sin(uv.x * 2.0 - iTime * 1.1 + uSeed * 3.0);
  vec2 grid = (uv + vec2(0.0, body)) * vec2(6.0, 8.0);

  // Odd rows shift by half a cell — the classic scale stagger.
  float row = floor(grid.y);
  float stagger = mod(row, 2.0) * 0.5;
  vec2 cell = vec2(floor(grid.x - stagger) + stagger, row);
  vec2 local = grid - cell - 0.5;

  // Each scale is a disc squashed on y; its rim is the visible overlap edge.
  float d = length(local * vec2(1.0, 1.4)) - 0.62;

  float fill = smoothstep(0.04, -0.04, d);
  float rim = exp(-abs(d) * 16.0);
  float inner = exp(-abs(d + 0.22) * 14.0) * fill;

  // Light sweeps diagonally; scales facing the crest flare.
  float sweep = 0.5 + 0.5 * sin(cell.x * 0.9 + cell.y * 0.55 - iTime * 2.0);
  float lit = fill * (0.25 + 0.75 * sweep);

  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(cell.y * 0.7 + iTime * 0.4));

  vec3 col = mix(uColBg, uColInk, 0.3);
  col = mix(col, tint * (0.45 + 0.55 * lit), fill * 0.85);
  col += tint * inner * 0.5;
  col += uColPaper * rim * 0.35;
  col += uColPaper * pow(lit, 3.0) * 0.5;

  fragColor = vec4(col, 1.0);
}
