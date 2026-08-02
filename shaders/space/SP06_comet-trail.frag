// One bright nucleus crosses a curved path while two distinct tails separate.
// A narrow signal stream and granular warm dust decay behind the moving head.

float sp06Hash(vec2 p) {
  p = fract(p * vec2(191.71, 437.29) + uSeed * 0.467);
  p += dot(p, p + 29.41);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  float travel = fract(t * 0.075 + 0.08);
  vec2 head = vec2(mix(-1.18, 1.18, travel),
                   0.22 + 0.24 * sin(travel * 4.6 + 0.7));
  vec2 rel = uv - head;
  float back = max(-rel.x, 0.0);
  float behind = step(rel.x, 0.0);

  float ionCenter = -0.025 * sin(back * 3.2 + t * 0.24);
  float ionWidth = 34.0 / (1.0 + back * 2.3);
  float ionTail = exp(-abs(rel.y - ionCenter) * ionWidth)
                  * exp(-back * 1.65) * behind;

  float dustCenter = 0.075 * back * back
                     + 0.025 * sin(back * 7.0 - t * 0.31);
  float dustWidth = 18.0 / (1.0 + back * 1.4);
  float dustTail = exp(-abs(rel.y - dustCenter) * dustWidth)
                   * exp(-back * 1.28) * behind;
  vec2 grainCell = floor(vec2(back * 56.0,
                              (rel.y - dustCenter) * 92.0) + uSeed * 13.0);
  float grain = 0.38 + 0.62 * pow(sp06Hash(grainCell), 5.0);
  dustTail *= grain;

  float nucleusDist = length(rel);
  float coma = exp(-nucleusDist * 17.0);
  float core = exp(-nucleusDist * 72.0);

  vec2 starGrid = (uv + uSeed * 0.018) * 83.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float stars = smoothstep(0.977, 0.999, sp06Hash(starCell))
                * exp(-dot(starLocal, starLocal) * 220.0);
  float sky = 0.5 + 0.5 * sin(uv.x * 2.2 - uv.y * 3.6 + t * 0.12);

  vec3 col = mix(uColBg, uColInk, 0.32 + sky * 0.1);
  col += uColPaper * stars * 0.72;
  col += uColSignal * ionTail * 1.05;
  col += uColAccent * dustTail * 0.82;
  col += uColSignal * coma * 1.18;
  col += uColAccent * coma * coma * 0.42;
  col = mix(col, uColPaper * 1.35, clamp(core * 1.3, 0.0, 1.0));
  fragColor = vec4(col, 1.0);
}
