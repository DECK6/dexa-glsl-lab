// Logarithmic spokes accelerate toward a dark sink while radial pulses
// slide inward, making the spiral feel continuously hungry.

float fl03Hash(float p) {
  return fract(sin(p * 127.1 + uSeed * 31.7) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.85 + uSeed * 0.37;
  vec2 center = 0.07 * vec2(
    sin(t * 0.47 + fl03Hash(1.0) * 6.28),
    cos(t * 0.39 + fl03Hash(2.0) * 6.28)
  );
  vec2 p = uv - center;
  float r = length(p);
  float theta = atan(p.y, p.x);

  float acceleration = 1.0 + 1.6 / (1.0 + r * 7.0);
  float spiralPhase = theta + 3.65 * log(r + 0.035) - t * acceleration;
  float spokes = 1.0 - smoothstep(0.07, 0.24, abs(sin(spiralPhase * 5.0)));
  float inward = fract(r * 9.0 + t * 0.72);
  float pulse = 1.0 - smoothstep(0.04, 0.16, abs(inward - 0.5));
  float funnel = 1.0 - smoothstep(0.08, 1.42, r);
  float eventRing = exp(-abs(r - 0.16 - 0.025 * sin(t * 2.0)) * 36.0);
  float sink = 1.0 - smoothstep(0.0, 0.105, r);

  vec3 col = mix(uColBg, uColInk, funnel * 0.42);
  col += uColSignal * spokes * funnel * (0.65 + 0.45 * pulse);
  col += uColAccent * pulse * spokes * (1.0 - sink) * 0.72;
  col += uColPaper * eventRing * 0.85;
  col = mix(col, uColBg, sink * 0.92);
  fragColor = vec4(col, 1.0);
}
