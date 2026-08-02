// The frame is an angular palette spectrum quantized into arcs. A sweep arm
// rotates through it, trailing brightness behind its leading edge.

vec3 spectrum(float t) {
  t = fract(t);
  float a = 0.5 + 0.5 * cos(6.2831 * t);
  float b = 0.5 + 0.5 * cos(6.2831 * (t - 0.25));
  float c = 0.5 + 0.5 * cos(6.2831 * (t - 0.5));
  float d = 0.5 + 0.5 * cos(6.2831 * (t - 0.75));
  a *= a; b *= b; c *= c; d *= d;
  return (uColSignal * a + uColPaper * b + uColAccent * c + uColDim * d) / (a + b + c + d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float r = length(uv);
  float ang = atan(uv.y, uv.x) / 6.2831 + 0.5;

  // stepping the radius stacks the fan into concentric arcs
  float rings = floor(r * 6.0 + iTime * 0.35);
  vec3 col = spectrum(ang + rings * 0.06 + iTime * 0.05 + uSeed * 0.3);

  float sweep = fract(ang - iTime * 0.16 + uSeed);
  col *= 0.18 + 0.95 * pow(1.0 - sweep, 2.6);
  col += uColPaper * smoothstep(0.018, 0.0, sweep) * 0.9;
  col += uColSignal * smoothstep(0.08, 0.0, fract(r * 6.0 + iTime * 0.35)) * 0.18;
  col = mix(col, uColBg, smoothstep(0.35, 1.5, r) * 0.55);

  fragColor = vec4(col, 1.0);
}
