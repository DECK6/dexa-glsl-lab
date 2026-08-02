// A brick mosaic where every tile holds a quantised value: a diagonal wave
// sweeps through, each tile snaps to its next step, and the rows slide as it passes.

float hash21(vec2 p) {
  p = fract(p * vec2(217.31, 143.97) + fract(uSeed * 0.0000181) * 19.7);
  p += dot(p, p + 41.23);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = fragCoord / iResolution.y * 13.0;

  float row = floor(p.y);
  p.x += 0.5 * mod(row, 2.0) + 0.22 * sin(iTime * 0.45 + row * 0.9);

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash21(id);

  float wave = 0.5 + 0.5 * sin(dot(id, vec2(0.42, 0.27)) - iTime * 1.3);
  float value = floor((0.45 * h + 0.55 * wave) * 5.0) / 4.0;

  float edge = max(abs(f.x), abs(f.y));
  float tile = smoothstep(0.47, 0.41, edge);
  float bevel = smoothstep(0.47, 0.30, edge);

  vec3 tone = mix(uColDim * 0.7, uColPaper, value);
  tone = mix(tone, uColSignal, smoothstep(0.60, 0.64, h) * value);
  tone = mix(tone, uColAccent, smoothstep(0.90, 0.94, h));

  vec3 col = mix(uColBg, uColInk, 0.8);
  col = mix(col, tone * (0.72 + 0.28 * bevel), tile);

  fragColor = vec4(col, 1.0);
}
