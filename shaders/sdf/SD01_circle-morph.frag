// A circle relaxing into regular polygons and back. Only the contour is drawn —
// hard core, exponential falloff — so the morph reads as a moving outline.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// iq's regular polygon field, evaluated for a real-valued side count.
float sdPolygon(vec2 p, float n, float r) {
  float a = atan(p.x, p.y);
  float seg = 6.2831853 / n;
  return cos(floor(0.5 + a / seg) * seg - a) * length(p) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.6 + uSeed * 6.2831853;

  vec2 p = rot(iTime * 0.22) * uv;

  // Side count drifts continuously; blend the two bracketing polygons.
  float sides = 3.0 + 4.0 * (0.5 + 0.5 * sin(t * 0.47));
  float lo = floor(sides);
  float poly = mix(sdPolygon(p, lo, 0.62), sdPolygon(p, lo + 1.0, 0.62), fract(sides));
  float circle = length(p) - 0.62;

  float morph = 0.5 + 0.5 * sin(t);
  float d = mix(circle, poly, morph);

  float edge = abs(d);
  float core = smoothstep(0.014, 0.002, edge);
  float glow = exp(-edge * 10.0);
  float fill = smoothstep(0.0, -0.45, d);

  vec3 col = uColBg;
  col = mix(col, uColInk, fill);
  col += uColSignal * glow * 0.9;
  col += uColAccent * exp(-edge * 38.0) * (0.3 + 0.7 * morph);
  col = mix(col, uColPaper, core);

  // Interior iso-rings expose the field itself, not just the boundary.
  float rings = smoothstep(0.75, 1.0, sin(d * 42.0 + iTime * 2.2));
  col += uColSignal * rings * fill * 0.25;

  fragColor = vec4(col, 1.0);
}
