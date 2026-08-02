// Block-addressed framebuffer with bad row pointers: tiles slide horizontally
// in stepped jumps while the plate underneath stays where it was.

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec3 plate(vec2 p) {
  vec2 c = floor(p * 8.0);
  float cell = hash21(c + 4.0);
  float band = smoothstep(0.45, 0.0, abs(p.x * 0.6 + p.y * 1.1));
  vec3 col = mix(uColBg, uColInk, 0.35 + 0.65 * step(0.5, cell));
  col = mix(col, uColSignal * 0.85, band * (0.3 + 0.7 * step(0.7, cell)));
  col = mix(col, uColAccent, step(0.86, cell) * step(cell, 0.94) * 0.75);
  col = mix(col, uColPaper, step(0.94, cell) * 0.8);
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float clock = mod(floor(iTime * 7.0), 2048.0);
  vec2 grid = vec2(6.0, 13.0);
  vec2 bid = floor(uv * grid);

  float pick = hash21(bid + clock * 3.7 + uSeed * 11.0);
  float live = step(0.55, pick);
  float amount = (hash21(bid.yx * 1.3 + clock + uSeed * 29.0) - 0.5) * 1.6 * live;

  vec3 col = plate(uv + vec2(amount, 0.0));

  // displaced blocks run hot and leave a hard seam at the tile boundary
  float far = live * step(0.15, abs(amount));
  col = mix(col, col * 1.4 + uColAccent * 0.22, far);
  vec2 f = fract(uv * grid);
  col += uColSignal * step(0.95, max(f.x, f.y)) * far * 0.55;

  fragColor = vec4(col, 1.0);
}
