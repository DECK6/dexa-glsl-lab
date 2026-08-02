// Rows of chevrons. Each row scrolls at its own rate in its own direction, and
// a runner packet sprints along it, lighting the arrows it overtakes.

float chevron(vec2 p, float w) {
  // Fold to a V: signed distance to the two arms of the arrow.
  float v = abs(p.x) * 0.75 - p.y;
  return smoothstep(w, w * 0.3, abs(v));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float rows = 6.0;
  float ry = uv.y * rows;
  float row = floor(ry);
  float fy = fract(ry) - 0.5;

  float dir = mod(row, 2.0) < 0.5 ? 1.0 : -1.0;
  float speed = 0.55 + 0.25 * fract(sin(row * 12.9898 + uSeed * 37.0) * 43758.5453);

  float rx = uv.x * 5.0 + iTime * speed * dir * 1.6 + row * 0.37;
  float fx = fract(rx) - 0.5;

  float arrow = chevron(vec2(fx, fy * 0.9), 0.22);

  // The runner wraps forever, one per row, offset so they never line up.
  float hx = (fract(iTime * 0.28 * dir + row * 0.19 + uSeed) * 2.0 - 1.0) * 1.9;
  float run = exp(-pow((uv.x - hx) * 2.2, 2.0));

  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(row * 1.1 + iTime * 0.4));

  vec3 col = mix(uColBg, uColInk, 0.28);
  col = mix(col, tint, arrow * 0.75);
  col += tint * arrow * run * 1.1;
  col = mix(col, uColPaper, arrow * run * 0.55);

  // Row separators keep the lanes legible.
  col = mix(col, uColDim, smoothstep(0.48, 0.5, abs(fy)) * 0.35);

  fragColor = vec4(col, 1.0);
}
