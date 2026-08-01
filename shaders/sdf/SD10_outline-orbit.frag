// Five different primitives — circle, triangle, square, pentagon, hexagon —
// each on its own orbit and spinning at its own rate. Contours only: the
// shapes are readable purely from their outlines crossing one another.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdPolygon(vec2 p, float n, float r) {
  float a = atan(p.x, p.y);
  float seg = 6.2831853 / n;
  return cos(floor(0.5 + a / seg) * seg - a) * length(p) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 col = uColBg;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float orbit = 0.18 + fi * 0.145;
    float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    float a = iTime * (0.85 - fi * 0.11) * dir + fi * 1.9 + uSeed * 6.2831853;

    vec2 c = vec2(cos(a), sin(a)) * orbit;
    vec2 p = rot(-a * 1.4) * (uv - c);

    float size = 0.175 - fi * 0.011;
    float d = (i == 0) ? length(p) - size : sdPolygon(p, 2.0 + fi, size);
    float e = abs(d);

    vec3 tint = mix(uColSignal, uColAccent, fi * 0.25);
    col += tint * exp(-e * 24.0) * 0.85;
    col = mix(col, uColPaper, smoothstep(0.009, 0.0, e));

    // Faint trace of the path each shape is riding.
    col += uColDim * exp(-abs(length(uv) - orbit) * 110.0) * 0.45;
  }

  col = mix(col, uColBg, smoothstep(0.95, 1.5, length(uv)) * 0.8);

  fragColor = vec4(col, 1.0);
}
