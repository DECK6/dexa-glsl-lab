// Tall aurora curtains descend from the dark ceiling in separate ribbons.
// Nested waves fold each veil, revealing cyan faces and orange seams.

float auroraHash(float n) {
  return fract(sin(n * 73.17 + uSeed * 19.31) * 15731.743);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float veils = 0.0;
  float seams = 0.0;
  float crowns = 0.0;

  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float base = mix(-0.92, 0.92, fi / 6.0);
    float wave = 0.13 * sin(uv.y * (2.0 + auroraHash(fi) * 2.2) + iTime * (0.34 + fi * 0.025) + fi);
    wave += 0.045 * sin(uv.y * 8.0 - iTime * 0.73 + fi * 2.1 + uSeed);
    float distanceToVeil = abs(uv.x - base - wave);
    float width = 0.085 + 0.055 * auroraHash(fi + 8.0);
    float ribbon = exp(-pow(distanceToVeil / width, 2.0));
    float fall = smoothstep(-1.08, 0.98, uv.y) * exp(-(0.98 - uv.y) * (0.32 + fi * 0.015));
    veils += ribbon * fall;
    seams += exp(-distanceToVeil * 58.0) * fall;
    crowns += ribbon * exp(-pow((uv.y - 0.72 + 0.05 * sin(fi)) * 4.0, 2.0));
  }

  float ripple = 0.78 + 0.22 * sin(uv.y * 19.0 - iTime * 1.2 + uv.x * 5.0);
  float horizon = exp(-abs(uv.y + 0.88) * 6.0);
  vec3 col = mix(uColBg, uColInk, 0.36 + horizon * 0.18);
  col += uColSignal * veils * ripple * 0.38;
  col += uColAccent * seams * 0.20;
  col += uColPaper * crowns * 0.22;
  fragColor = vec4(col, 1.0);
}
