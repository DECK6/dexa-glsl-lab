// Warp and weft strands crossing in a plain weave. Cell parity decides which
// strand passes over, and a diagonal swell makes the cloth billow.

float strand(float x, float w) {
  return smoothstep(w, w * 0.45, abs(x));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float swell = 0.09 * sin(uv.x * 2.4 + iTime * 0.7 + uSeed * 4.0)
              + 0.07 * sin(uv.y * 2.9 - iTime * 0.55);
  vec2 p = uv + vec2(swell, swell * 0.8);

  float cells = 7.0;
  vec2 grid = p * cells;
  vec2 cell = floor(grid);
  vec2 f = fract(grid) - 0.5;

  float parity = mod(cell.x + cell.y, 2.0);

  float warp = strand(f.x, 0.34);
  float weft = strand(f.y, 0.34);

  // Cross-thread shading gives each round thread its roll.
  float warpLit = warp * (0.55 + 0.45 * cos(f.x * 4.4));
  float weftLit = weft * (0.55 + 0.45 * cos(f.y * 4.4));

  vec3 warpCol = mix(uColSignal, uColPaper, 0.25) * warpLit;
  vec3 weftCol = mix(uColAccent, uColPaper, 0.20) * weftLit;

  vec3 col = mix(uColBg, uColInk, 0.3);

  // Under-strand first, over-strand on top — parity flips the order.
  if (parity < 0.5) {
    col = mix(col, weftCol, weft * 0.9);
    col = mix(col, warpCol, warp * 0.95);
  } else {
    col = mix(col, warpCol, warp * 0.9);
    col = mix(col, weftCol, weft * 0.95);
  }

  // A sheen band travels with the swell and catches the raised threads.
  float sheen = exp(-pow((p.y - sin(iTime * 0.5) * 0.9) * 2.0, 2.0));
  col += uColPaper * sheen * (warpLit + weftLit) * 0.25;

  fragColor = vec4(col, 1.0);
}
