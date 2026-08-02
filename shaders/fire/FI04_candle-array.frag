// A field of candles with independent flame clocks. Each wick bends, stretches,
// and briefly flares while wax bodies catch the neighbouring light.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45) + uSeed * 0.17);
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float boxDistance(vec2 p, vec2 halfSize) {
  vec2 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * vec2(2.4, 2.0);
  vec2 cellId = floor(p);
  vec2 local = fract(p) - 0.5;
  float rnd = hash21(cellId);
  float phase = iTime * (2.2 + rnd * 1.7) + rnd * 9.0;

  float bodyHeight = 0.18 + rnd * 0.12;
  vec2 bodyPoint = local - vec2(0.0, -0.5 + bodyHeight);
  float wax = 1.0 - smoothstep(-0.015, 0.025, boxDistance(bodyPoint, vec2(0.12, bodyHeight)));
  float wick = smoothstep(0.025, 0.006, abs(local.x))
    * smoothstep(0.03, -0.01, abs(local.y - bodyHeight * 2.0 + 0.42) - 0.08);

  float sway = sin(phase) * 0.055;
  vec2 flamePoint = local - vec2(sway, bodyHeight * 2.0 - 0.27);
  flamePoint.x *= 1.4;
  flamePoint.y += abs(flamePoint.x) * 0.7;
  float flameShape = length(flamePoint * vec2(1.0, 0.65));
  float flame = smoothstep(0.2, 0.035, flameShape) * smoothstep(0.3, -0.08, flamePoint.y);
  float flare = 0.72 + 0.28 * sin(phase * 1.7);
  float glow = exp(-length(flamePoint) * 7.0) * flare;

  vec3 col = mix(uColBg, uColInk, 0.42 + 0.18 * (local.y + 0.5));
  col = mix(col, uColDim, wax * 0.62);
  col = mix(col, uColPaper, wax * (0.38 + 0.25 * glow));
  col = mix(col, uColInk, wick * 0.9);
  col += uColAccent * glow * 0.52;
  col = mix(col, uColAccent, flame * 0.92);
  col = mix(col, uColPaper, flame * smoothstep(0.15, 0.0, flameShape));
  col += uColSignal * wax * glow * 0.09;

  fragColor = vec4(col, 1.0);
}
