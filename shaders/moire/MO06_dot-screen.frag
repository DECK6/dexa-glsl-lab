// Two halftone screens laid over each other at a print-shop angle. The angle
// gap opens and closes, so the rosette swings from a fine grain to a coarse
// flower; the dot sizes trade off across a travelling tone ramp.

vec2 rot(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c) * p;
}

float dots(vec2 p, float cells, float angle, float radius) {
  vec2 q = rot(p, angle) * cells;
  vec2 f = fract(q) - 0.5;
  return smoothstep(radius, radius - 0.14, length(f));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float base = 0.26 + iTime * 0.04 + uSeed;
  float gap = 0.045 + 0.075 * (0.5 + 0.5 * sin(iTime * 0.23));

  float tone = 0.5 + 0.5 * sin(length(uv) * 3.4 - iTime * 0.8);
  float cells = 20.0;
  float d1 = dots(uv, cells, base + gap, mix(0.13, 0.44, tone));
  float d2 = dots(uv, cells * 1.02, base - gap, mix(0.44, 0.13, tone));

  vec3 col = mix(uColBg, uColInk, 0.5 + 0.5 * tone);
  col = mix(col, uColDim, max(d1, d2) * 0.25);
  col += uColSignal * d1 * 0.85;
  col += uColAccent * d2 * 0.85;
  col = mix(col, uColPaper, d1 * d2);

  fragColor = vec4(col, 1.0);
}
