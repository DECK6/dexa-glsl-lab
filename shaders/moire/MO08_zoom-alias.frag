// One ring stack sampled at two zoom levels at once. The scale gap decides how
// many moire rings fit on screen, so widening and closing the gap makes the
// whole field breathe in and out of resolution.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 hub = vec2(sin(iTime * 0.19 + uSeed), cos(iTime * 0.23)) * 0.12;
  float r = length(uv - hub);

  float k = 118.0;
  float zoom = 1.16 + 0.09 * sin(iTime * 0.31);
  float pa = r * k - iTime * 2.6;
  float pb = r * k * zoom - iTime * 2.6 * zoom;

  float fringe = sin(pa) * sin(pb);
  float beat = cos(pa - pb);
  float lit = smoothstep(0.0, 0.85, fringe);
  float ring = smoothstep(0.3, 0.98, beat);
  float gap = smoothstep(0.3, 0.98, -beat);

  vec3 col = mix(uColBg, uColInk, 0.55);
  col = mix(col, uColDim, lit * 0.5);
  col = mix(col, uColSignal, lit * ring);
  col = mix(col, uColPaper, lit * pow(ring, 3.0) * 0.7);
  col += uColAccent * gap * (0.15 + 0.45 * lit);

  fragColor = vec4(col, 1.0);
}
