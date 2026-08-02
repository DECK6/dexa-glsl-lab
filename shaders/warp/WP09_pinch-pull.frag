// Two travelling centres take turns pinching and pulling: the radius is raised
// to a power that swings above and below 1, so a ring-and-spoke target keeps
// stretching out and snapping back.

vec2 pinch(vec2 p, vec2 c, float power, float radius) {
  vec2 d = p - c;
  float r = length(d) + 1e-5;
  float k = smoothstep(radius, 0.0, r);
  float e = mix(1.0, power, k);
  return c + d / r * pow(r, e);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float t = iTime * 0.5 + uSeed;
  float pulse = sin(iTime * 0.9 + uSeed * 1.7);
  vec2 ca = vec2(cos(t * 0.7), sin(t)) * 0.55;
  vec2 cb = -ca * 0.9;

  vec2 w = uv;
  w = pinch(w, ca, 1.0 + 1.1 * pulse, 0.95);
  w = pinch(w, cb, 1.0 - 0.55 * pulse, 0.8);

  float r = length(w);
  float ang = atan(w.y, w.x);
  float rings = smoothstep(0.36, 0.5, abs(fract(r * 6.0 - iTime * 0.5) - 0.5));
  float spokes = smoothstep(0.4, 0.5, abs(fract(ang / 6.2831853 * 16.0) - 0.5));
  float stretch = length(w - uv) * 2.2;

  vec3 col = mix(uColBg, uColInk, 0.4 + 0.5 * spokes);
  col = mix(col, uColDim * 0.85, spokes * 0.5);
  col = mix(col, uColSignal, rings * (0.45 + 0.55 * spokes));
  col = mix(col, uColAccent, smoothstep(0.25, 0.9, stretch) * (0.3 + 0.7 * rings));
  col = mix(col, uColPaper, rings * spokes * 0.7);

  fragColor = vec4(col, 1.0);
}
