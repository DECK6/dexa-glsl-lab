// A centrifugal spark wheel: hot grains accelerate along rotating spokes,
// leave curved afterimages, and flash when they cross the outer guard ring.

float hash11(float p) {
  p = fract(p * 0.1031 + uSeed * 0.037);
  p *= p + 33.33;
  return fract(p * (p + p));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x) + iTime * 0.75;
  float spokeCoord = (angle + 3.1415927) / 6.2831853 * 14.0;
  float spokeId = floor(spokeCoord);
  float spoke = exp(-abs(fract(spokeCoord) - 0.5) * 24.0) * smoothstep(0.92, 0.12, radius);

  float phase = fract(iTime * (0.42 + hash11(spokeId) * 0.25) + hash11(spokeId + 31.0));
  float sparkRadius = 0.12 + phase * phase * 0.86;
  float grain = exp(-abs(radius - sparkRadius) * 85.0)
    * exp(-abs(fract(spokeCoord) - 0.5) * 65.0);
  float trail = smoothstep(sparkRadius, sparkRadius - 0.28, radius)
    * smoothstep(sparkRadius - 0.5, sparkRadius - 0.18, radius) * spoke;
  float guard = exp(-abs(radius - 0.93) * 52.0);
  float hub = exp(-radius * radius * 55.0);

  vec3 col = mix(uColBg, uColInk, 0.35 + guard * 0.35);
  col += uColDim * spoke * 0.45;
  col += uColAccent * (trail * 0.75 + grain * 1.8 + hub * 0.8);
  col = mix(col, uColPaper, clamp(grain * 1.4 + hub, 0.0, 1.0));
  col += uColSignal * guard * (0.18 + grain * 0.4);

  fragColor = vec4(col, 1.0);
}
