// Five 2D metaballs joined with a polynomial smooth-min. They drift on
// independent orbits, so the blend necks stretch, snap, and reform.

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float d = 10.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = iTime * (0.45 + fi * 0.14) + fi * 1.2566 + uSeed * 6.2831853;
    vec2 c = vec2(
      cos(a) * (0.34 + 0.20 * sin(iTime * 0.37 + fi)),
      sin(a * 1.31) * (0.30 + 0.18 * cos(iTime * 0.29 + fi * 2.0))
    );
    float r = 0.13 + 0.05 * sin(iTime * 0.95 + fi * 2.1);
    d = smin(d, length(uv - c) - r, 0.24);
  }

  float fill = smoothstep(0.010, -0.010, d);
  float glow = exp(-abs(d) * 8.0);
  float rim = smoothstep(0.014, 0.0, abs(d));

  // Interior iso-bands travel inward and reveal the blended field.
  float bands = smoothstep(0.35, 0.95, sin(d * 55.0 - iTime * 3.0));

  vec3 col = uColBg;
  col += uColSignal * glow * 0.95;
  col = mix(col, uColInk, fill);
  col += uColAccent * fill * bands * 0.6;
  col = mix(col, uColPaper, rim);

  fragColor = vec4(col, 1.0);
}
