// A combustion front races around an expanding ring. The paper grid chars
// behind the front while angular tongues lick ahead of it and then reset.

float hash11(float p) {
  p = fract(p * 0.1031 + uSeed * 0.017);
  p *= p + 33.33;
  return fract(p * (p + p));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float cycle = fract(iTime * 0.16 + uSeed * 0.071);
  float frontRadius = mix(0.12, 1.28, cycle);

  float angularCell = floor((angle + 3.1415927) * 18.0);
  float flutter = sin(angle * 13.0 - iTime * 5.2) * 0.035
    + (hash11(angularCell + floor(iTime * 8.0)) - 0.5) * 0.055;
  float signedFront = radius - frontRadius - flutter;
  float flame = exp(-abs(signedFront) * 30.0) * smoothstep(0.12, -0.05, signedFront);
  float halo = exp(-abs(signedFront) * 8.0);
  float charred = smoothstep(0.04, -0.2, signedFront) * smoothstep(-1.05, -0.6, signedFront);

  vec2 grid = abs(fract(uv * 7.0) - 0.5);
  float paperGrid = smoothstep(0.47, 0.5, max(grid.x, grid.y));
  vec3 col = mix(uColBg, uColDim, paperGrid * 0.22);
  col = mix(col, uColInk, charred * 0.92);
  col += uColAccent * halo * (0.35 + flame * 1.2);
  col = mix(col, mix(uColAccent, uColPaper, 0.72), clamp(flame * 1.15, 0.0, 1.0));
  col += uColPaper * exp(-abs(signedFront) * 75.0) * 0.75;
  col += uColSignal * paperGrid * smoothstep(0.22, 0.0, abs(signedFront)) * 0.22;

  fragColor = vec4(col, 1.0);
}
