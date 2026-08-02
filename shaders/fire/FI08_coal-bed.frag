// A bed of irregular coals: rounded stones breathe on offset thermal cycles,
// and the narrow gaps flash as oxygen reaches the buried heat.

float hash21(vec2 p) {
  p = fract(p * vec2(443.897, 441.423) + uSeed * 0.21);
  p += dot(p, p.yx + 19.19);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * vec2(3.4, 3.0);
  vec2 cellId = floor(p);
  vec2 local = fract(p) - 0.5;
  local.x += (hash21(cellId + 2.0) - 0.5) * 0.22;
  local.y += (hash21(cellId + 5.0) - 0.5) * 0.18;

  float rnd = hash21(cellId);
  float stoneDistance = length(local * vec2(1.0 + rnd * 0.35, 0.82 + rnd * 0.2));
  float stone = smoothstep(0.48, 0.38, stoneDistance);
  float rim = smoothstep(0.5, 0.43, stoneDistance) - smoothstep(0.43, 0.35, stoneDistance);
  float heat = 0.5 + 0.5 * sin(iTime * (0.65 + rnd * 0.7) + rnd * 12.0);
  heat = heat * heat * (0.45 + 0.55 * smoothstep(0.5, 0.05, stoneDistance));
  float crack = exp(-min(abs(local.x + local.y * 0.4), abs(local.y - local.x * 0.55)) * 34.0);
  crack *= stone * smoothstep(0.18, 0.35, stoneDistance);

  vec3 col = mix(uColBg, uColInk, 0.75);
  col = mix(col, uColDim * 0.42, stone);
  col += uColAccent * stone * heat * 0.9;
  col += uColAccent * rim * (0.25 + heat * 0.65);
  col = mix(col, uColPaper, crack * heat * 0.68);
  col += uColSignal * rim * (1.0 - heat) * 0.08;

  fragColor = vec4(col, 1.0);
}
