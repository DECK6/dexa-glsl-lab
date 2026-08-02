// Rain on standing water. Three offset grids each fire their cells on their
// own clock, so drops land at random times and never in a visible lattice.

float hash21(vec2 p) {
  p = fract(p * vec2(213.71, 419.33) + uSeed);
  p += dot(p, p + 31.17);
  return fract(p.x * p.y);
}

float dropLayer(vec2 uv, float scale, float period, float phase) {
  vec2 p = uv * scale + phase;
  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  vec2 jitter = (vec2(hash21(id), hash21(id + 5.31)) - 0.5) * 0.6;
  float birth = hash21(id + 11.7);
  float t = fract(iTime / period + birth);

  float d = length(f - jitter);
  float r = t * 0.62;
  float fade = (1.0 - t) * (1.0 - t);

  float ring = smoothstep(0.05, 0.0, abs(d - r)) * fade;
  ring += smoothstep(0.035, 0.0, abs(d - r * 0.5)) * fade * 0.55;
  return ring;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float rings = 0.0;
  rings += dropLayer(uv, 3.0, 1.7, 0.0);
  rings += dropLayer(uv, 5.0, 1.15, 7.3) * 0.8;
  rings += dropLayer(uv, 8.0, 0.85, 19.1) * 0.55;

  // the sheet keeps breathing under the drops
  float sheet = sin(uv.x * 3.0 + iTime * 0.6) * sin(uv.y * 2.4 - iTime * 0.45);

  vec3 col = mix(uColBg, uColInk, 0.28 + 0.16 * sheet);
  col = mix(col, uColSignal, clamp(rings, 0.0, 1.0));
  col = mix(col, uColPaper, smoothstep(0.8, 1.45, rings));
  col += uColAccent * smoothstep(1.15, 1.8, rings) * 0.7;

  fragColor = vec4(col, 1.0);
}
