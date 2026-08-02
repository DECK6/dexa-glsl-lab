// Angular mirror-fold into N sectors, then a log-polar drift: the pattern
// streams out of the centre at constant apparent speed while the whole
// kaleidoscope turns, so it never runs out of material.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float sectors = 8.0 + 2.0 * floor(mod(uSeed, 3.0));
  float seg = 6.2831853 / sectors;

  float r = length(uv) + 1e-4;
  float a = atan(uv.y, uv.x) + iTime * 0.22 + uSeed * 0.3;
  a = abs(mod(a, seg) - seg * 0.5);

  // log-polar: a constant offset in y is a constant-rate zoom on screen
  float lr = log(r) * 1.5 + iTime * 0.35;
  vec2 w = vec2(a * 4.5, lr);

  float rings = smoothstep(0.34, 0.5, abs(fract(w.y) - 0.5));
  float ribs = smoothstep(0.3, 0.5, abs(fract(w.x * 1.6) - 0.5));
  float jewel = smoothstep(0.42, 0.12, length(fract(w * vec2(1.3, 1.0) + 0.5) - 0.5));

  float core = exp(-r * 3.5);
  float petal = rings * ribs;

  vec3 col = mix(uColBg, uColInk, 0.35 + 0.5 * ribs);
  col = mix(col, uColDim * 0.8, rings * 0.4);
  col = mix(col, uColSignal, petal * 0.95);
  col = mix(col, uColAccent, jewel * (0.35 + 0.65 * ribs));
  col = mix(col, uColPaper, core * 0.9 + petal * core * 0.6);

  fragColor = vec4(col, 1.0);
}
