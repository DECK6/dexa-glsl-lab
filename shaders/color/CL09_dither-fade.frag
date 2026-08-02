// An ordered Bayer matrix turns two travelling fade fields into a dot-pattern
// crossfade. The dot grid stays locked to the raster while the fades move.

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(a * 0.5) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(a * 0.5) * 0.25 + bayer2(a);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float px = max(2.0, floor(iResolution.y / 170.0));
  vec2 cell = floor(fragCoord / px);

  // two independent fades, so three palette colors trade territory
  float waveA = 0.5 + 0.44 * sin(uv.x * 1.7 + uv.y * 1.1 + iTime * 0.8 + uSeed * 6.2831);
  float waveB = 0.5 + 0.44 * sin(length(uv * 1.6) * 3.0 - iTime * 1.1);

  float threshold = bayer8(cell);
  float bitA = step(threshold, waveA);
  float bitB = step(threshold, waveB * 0.9);

  vec3 col = mix(uColBg, uColSignal, bitA);
  col = mix(col, uColAccent, bitA * bitB);
  col = mix(col, uColPaper, step(0.72, waveA * waveB) * bitA * bitB);
  col = mix(col, uColDim, (1.0 - bitA) * bitB * 0.5);

  // an undithered rule between cells keeps the raster structure legible
  vec2 g = fract(fragCoord / px);
  col *= 0.86 + 0.14 * step(0.14, min(g.x, g.y));

  fragColor = vec4(col, 1.0);
}
