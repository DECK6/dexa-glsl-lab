// A hexagonal comb filling with honey: each cell's level rises on its own clock
// until the meniscus tops out, and beads run down the face of the comb.

float hash21(vec2 p) {
  p = fract(p * vec2(173.53, 291.19) + fract(uSeed * 0.0000163) * 23.4);
  p += dot(p, p + 38.71);
  return fract(p.x * p.y);
}

// xy = position inside the cell, zw = cell centre
vec4 hexCell(vec2 p) {
  vec2 s = vec2(1.0, 1.7320508);
  vec2 a = mod(p, s) - 0.5 * s;
  vec2 b = mod(p - 0.5 * s, s) - 0.5 * s;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return vec4(g, p - g);
}

float hexDist(vec2 p) {
  p = abs(p);
  return max(p.x, dot(p, vec2(0.5, 0.8660254)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 4.5;

  vec4 hc = hexCell(uv + vec2(0.0, iTime * 0.22));
  float h = hash21(hc.zw);
  float edge = hexDist(hc.xy);
  float wall = smoothstep(0.50, 0.43, edge);
  float rim = smoothstep(0.055, 0.0, abs(edge - 0.465));

  float level = -0.62 + 1.24 * fract(iTime * 0.19 + h);
  float honey = wall * smoothstep(0.03, -0.02, hc.y - level);
  float meniscus = wall * smoothstep(0.06, 0.0, abs(hc.y - level));

  vec3 col = mix(uColBg, uColInk, wall);
  col = mix(col, uColAccent * (0.55 + 0.45 * h), honey);
  col = mix(col, uColPaper, meniscus * 0.75);
  col = mix(col, uColSignal, rim * 0.45);

  float lane = floor(uv.x * 1.5);
  float drop = fract(iTime * 0.33 + hash21(vec2(lane, 4.0)));
  vec2 dq = vec2(fract(uv.x * 1.5) - 0.5, (uv.y - 2.4 + drop * 5.4) * 0.55);
  col += uColAccent * smoothstep(0.10, 0.0, length(dq)) * 1.1;

  fragColor = vec4(col, 1.0);
}
