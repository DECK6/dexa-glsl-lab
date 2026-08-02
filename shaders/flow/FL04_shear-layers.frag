// Alternating horizontal currents slide past one another. Their shared
// interfaces curl into compact Kelvin-Helmholtz-like ripples.

float fl04Hash(float p) {
  return fract(sin(p * 91.7 + uSeed * 17.3) * 15341.743);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.64 + uSeed * 0.29;
  float roughId = floor((uv.y + 1.2) * 4.0);
  float direction = mod(roughId, 2.0) * 2.0 - 1.0;
  float seedPhase = fl04Hash(roughId + 3.0) * 6.283;

  float rolling = sin(uv.x * 4.2 + direction * t * 1.8 + seedPhase);
  rolling += 0.38 * sin(uv.x * 9.5 - direction * t * 1.1 + roughId);
  float yWarp = uv.y + rolling * 0.055;
  float layerCoord = (yWarp + 1.2) * 4.0;
  float bandId = floor(layerCoord);
  float cell = fract(layerCoord);
  float edgeDistance = min(cell, 1.0 - cell);

  float interfaceGlow = 1.0 - smoothstep(0.025, 0.16, edgeDistance);
  float slipPhase = (uv.x - direction * t * 0.22) * 12.0 + bandId * 1.9;
  float slip = 1.0 - smoothstep(0.10, 0.34, abs(sin(slipPhase)));
  float layerLight = 0.28 + 0.20 * sin(bandId * 2.37 + uSeed);
  float rollCore = interfaceGlow * exp(-abs(sin(uv.x * 2.1 + direction * t)) * 1.8);

  vec3 bandCol = mix(uColDim, uColSignal, 0.5 + 0.5 * direction);
  vec3 col = mix(uColBg, uColInk, 0.32 + layerLight);
  col = mix(col, bandCol, 0.20 + slip * 0.28);
  col += uColAccent * interfaceGlow * (0.55 + rollCore * 0.55);
  col += uColPaper * interfaceGlow * slip * 0.52;
  fragColor = vec4(col, 1.0);
}
