// Two quiet lights share one elliptical orbit and illuminate its faint rail.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float angle = iTime * 0.46 + uSeed * 1.937;
  vec2 orbitSize = vec2(0.54, 0.34);
  vec2 axis = vec2(cos(angle), sin(angle));
  vec2 pointA = axis * orbitSize;
  vec2 pointB = -pointA;

  float dA = length(uv - pointA);
  float dB = length(uv - pointB);
  float glowA = exp(-dA * 10.0);
  float glowB = exp(-dB * 10.0);
  float coreA = 1.0 - smoothstep(0.018, 0.052, dA);
  float coreB = 1.0 - smoothstep(0.018, 0.052, dB);

  vec2 railUv = uv / orbitSize;
  float rail = exp(-abs(length(railUv) - 1.0) * 24.0);
  float centerHaze = exp(-length(uv) * 2.2) * 0.16;

  vec3 col = mix(uColBg, uColDim, 0.12 + centerHaze);
  col += uColSignal * (rail * 0.13 + glowA * 0.72);
  col += uColAccent * (rail * 0.07 + glowB * 0.72);
  col = mix(col, uColPaper, max(coreA, coreB));

  fragColor = vec4(col, 1.0);
}
