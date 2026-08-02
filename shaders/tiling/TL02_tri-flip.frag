// Every square splits into two right triangles and each one flips on its own
// clock — squashing edge-on, then opening on the other face's colour.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.0;
  vec2 id = floor(p);
  vec2 g = fract(p) - 0.5;

  float upper = step(0.0, g.x + g.y);
  vec2 centre = (upper > 0.5 ? vec2(1.0) : vec2(-1.0)) / 6.0;

  float flip = cos(iTime * 1.7 + hash21(id + upper * 7.31 + uSeed) * 6.2831 + dot(id, vec2(0.7, 0.45)));
  float squash = max(abs(flip), 0.07);

  // squash the local frame along y — the tile turns edge-on and back
  vec2 q = centre + (g - centre) / vec2(1.0, squash);

  float d = upper > 0.5
    ? min(min(0.5 - q.x, 0.5 - q.y), (q.x + q.y) * 0.7071)
    : min(min(q.x + 0.5, q.y + 0.5), -(q.x + q.y) * 0.7071);

  float face = smoothstep(0.0, 0.03, d - 0.03);
  float rim = smoothstep(0.05, 0.0, abs(d - 0.035));

  vec3 tint = flip > 0.0 ? uColSignal : uColAccent;
  vec3 col = mix(uColBg, uColInk, 0.7);
  col = mix(col, tint * (0.3 + 0.7 * squash), face);
  col = mix(col, uColPaper, rim * (0.2 + 0.7 * squash));
  col += uColDim * 0.25 * smoothstep(0.0, 0.06, d);

  fragColor = vec4(col, 1.0);
}
