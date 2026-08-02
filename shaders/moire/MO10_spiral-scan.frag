// A spiral grating crossed with a spoke rake, read by a radar sweep. The
// sweep flares whatever fringe it is passing over, so the interference is
// revealed a wedge at a time instead of all at once.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float r = length(uv);
  float th = atan(uv.y, uv.x);

  float pa = r * 96.0 + th * 9.0 - iTime * 2.2;
  float pb = th * 27.0 + r * 14.0 + iTime * 0.8 + uSeed;

  float damp = smoothstep(0.03, 0.30, r);
  float fringe = sin(pa) * sin(pb);
  float lit = smoothstep(-0.1, 0.85, fringe) * damp;
  float band = smoothstep(-0.1, 0.95, cos(pa - pb)) * damp;

  float head = iTime * 1.1;
  float delta = abs(mod(th - head + 3.14159265, 6.28318531) - 3.14159265);
  float sweep = exp(-delta * 3.2);

  vec3 col = mix(uColBg, uColInk, 0.6);
  col = mix(col, uColDim, lit * 0.5);
  col = mix(col, uColSignal, lit * (0.3 + 0.7 * band));
  col = mix(col, uColPaper, lit * band * sweep);
  col += uColAccent * sweep * (0.15 + 0.85 * band) * damp;

  fragColor = vec4(col, 1.0);
}
