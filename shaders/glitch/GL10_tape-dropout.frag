// Helical tape dropout: a ghosted picture drifts behind the current field,
// oxide loss cuts white dashes, and the head-switching band chews the bottom.

float hash11(float p) {
  p = fract(p * 0.1031 + uSeed * 0.019);
  p *= p + 33.33;
  return fract(p * (p + p));
}

vec3 tapePicture(vec2 p) {
  float horizon = smoothstep(0.035, 0.0, abs(p.y + 0.25 + sin(p.x * 4.0) * 0.08));
  float sun = smoothstep(0.35, 0.31, length(p - vec2(0.32, 0.28)));
  float bars = step(0.55, fract((p.x + 1.0) * 3.0));
  vec3 col = mix(uColBg, uColInk, 0.75);
  col = mix(col, uColSignal, horizon * 0.95);
  col = mix(col, uColAccent, sun * 0.88);
  col = mix(col, uColDim, bars * smoothstep(-0.1, 0.9, p.y) * 0.35);
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float row = floor(fragCoord.y);
  float clock = floor(iTime * 24.0);
  float rowNoise = hash11(row + clock * 7.0);
  float trackingY = -0.82 + 0.13 * sin(iTime * 1.7) + 0.04 * sin(iTime * 7.0);
  float tracking = exp(-abs(uv.y - trackingY) * 18.0);
  float offset = (rowNoise - 0.5) * 0.025 + tracking * sin(iTime * 14.0 + uv.y * 40.0) * 0.34;

  vec3 currentField = tapePicture(vec2(uv.x + offset, uv.y));
  vec3 ghostField = tapePicture(vec2(uv.x - 0.055 - offset * 0.35, uv.y + 0.018));
  vec3 col = mix(currentField, ghostField, 0.22 + tracking * 0.28);

  float dashCell = floor(fragCoord.x / 11.0);
  float dropout = step(0.86, hash11(dashCell + row * 0.13 + clock * 3.0));
  dropout *= step(0.72, rowNoise);
  float headNoise = hash11(floor(fragCoord.x / 2.0) + clock * 13.0);
  col = mix(col, uColPaper, dropout * 0.82);
  col = mix(col, mix(uColBg, uColPaper, headNoise), tracking * 0.62);
  col *= 0.72 + 0.28 * step(0.5, fract(fragCoord.y * 0.5));
  col += uColAccent * tracking * dropout * 0.6;

  fragColor = vec4(col, 1.0);
}
