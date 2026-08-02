// A smooth diagonal gradient forced through a moving quantizer. The step count
// breathes between coarse and fine, so bands split and merge as they scroll.

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(uColBg, uColSignal, smoothstep(0.0, 0.38, t));
  c = mix(c, uColPaper, smoothstep(0.34, 0.62, t));
  c = mix(c, uColAccent, smoothstep(0.60, 0.88, t));
  c = mix(c, uColDim, smoothstep(0.88, 1.0, t));
  return c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // the underlying continuous gradient, gently warped
  float g = uv.y * 0.55 + uv.x * 0.30 + 0.32 * sin(uv.x * 1.9 - iTime * 0.5);

  float levels = mix(5.0, 14.0, 0.5 + 0.5 * sin(iTime * 0.33 + uSeed));
  float raw = g * levels - iTime * 1.1;
  float index = floor(raw);
  float within = fract(raw);

  float t = fract(index / levels * 0.85 + uSeed * 0.21);
  vec3 col = ramp(abs(t * 2.0 - 1.0));

  // every fifth band flags accent; each band edge gets a rule and a highlight
  col = mix(col, uColAccent, step(4.0, mod(index, 5.0)) * 0.55);
  col = mix(col, uColBg, smoothstep(0.09, 0.0, within) * 0.85);
  col = mix(col, uColPaper, smoothstep(0.0, 0.04, within) * smoothstep(0.11, 0.05, within) * 0.6);

  fragColor = vec4(col, 1.0);
}
