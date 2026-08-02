// Sierpinski gasket as a kaleidoscopic IFS: scale the plane by two about
// whichever triangle vertex is nearest, nine times over, and read the leftover
// radius back as a distance estimate. Each level also gets a shared twist, so
// the gasket shears into a spiral and unwinds again.

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

float gasket(vec2 p, float twist, out float lvl) {
  mat2 R = rot(twist);
  float scale = 1.0;
  lvl = 0.0;
  for (int i = 0; i < 9; i++) {
    p = R * p;
    vec2 v = vec2(0.0, 1.0);
    float best = distance(p, v);
    vec2 v1 = vec2(-0.8660254, -0.5);
    float d1 = distance(p, v1);
    if (d1 < best) { best = d1; v = v1; }
    vec2 v2 = vec2(0.8660254, -0.5);
    float d2 = distance(p, v2);
    if (d2 < best) { best = d2; v = v2; }
    p = 2.0 * p - v;
    scale *= 2.0;
    if (dot(p, p) > 90.0) break;
    lvl += 1.0;
  }
  return (length(p) - 1.0) / scale;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y * 1.3;
  uv = rot(iTime * 0.12) * uv;

  float lvl = 0.0;
  float d = gasket(uv, 0.16 * sin(iTime * 0.4), lvl);
  float px = 2.6 / iResolution.y;
  float depth = lvl / 9.0;
  float pulse = 0.5 + 0.5 * cos(lvl * 1.4 - iTime * 1.8);

  vec3 col = mix(uColBg, uColInk, 0.75);
  col = mix(col, uColSignal * (0.30 + 0.70 * pulse), smoothstep(0.15, 0.95, depth) * 0.55);
  col += uColAccent * exp(-max(d, 0.0) * 26.0) * (0.35 + 0.45 * depth);
  col = mix(col, uColPaper, smoothstep(px * 2.0, -px, d));

  fragColor = vec4(col, 1.0);
}
