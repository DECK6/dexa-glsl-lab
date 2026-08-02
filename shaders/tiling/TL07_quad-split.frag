// A breathing quadtree: the split threshold rises and falls, so cells keep
// quartering themselves and merging back four levels deep.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 1.6 + 8.0;

  float threshold = 0.45 + 0.33 * sin(iTime * 0.55 + uSeed);
  float depth = 0.0;

  for (int i = 0; i < 4; i++) {
    if (hash21(floor(p) + depth * 13.7 + uSeed) > threshold + depth * 0.05) break;
    p *= 2.0;
    depth += 1.0;
  }

  vec2 id = floor(p);
  vec2 g = fract(p) - 0.5;
  float border = 0.5 - max(abs(g.x), abs(g.y));

  float pulse = 0.5 + 0.5 * sin(iTime * 2.2 - depth * 1.3 + hash21(id + 3.7) * 6.2831);
  float frame = smoothstep(0.03, 0.0, border);
  float plate = smoothstep(0.02, 0.16, border);

  vec3 fill = mix(uColSignal, uColAccent, depth * 0.25);
  vec3 col = uColBg;
  col = mix(col, uColInk, plate);
  col = mix(col, fill * (0.25 + 0.75 * pulse), plate * (0.3 + 0.45 * pulse));
  col = mix(col, uColDim, frame * 0.7);
  col = mix(col, uColPaper, frame * pulse * 0.8);

  fragColor = vec4(col, 1.0);
}
