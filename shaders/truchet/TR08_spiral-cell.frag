// Every tile carries a compact Archimedean spiral. Hash-driven quarter turns
// point the loose ends at different neighbours while a highlight winds inward.

float hash21(vec2 p) {
  p = fract(p * vec2(191.3, 233.7) + uSeed * 0.47);
  p += dot(p, p + 29.7);
  return fract(p.x * p.y);
}

mat2 rotate2(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.0;
  vec2 tileId = floor(p);
  vec2 local = fract(p) - 0.5;
  float rnd = hash21(tileId);
  local = rotate2(floor(rnd * 4.0) * 1.5707963) * local;

  float angle = atan(local.y, local.x) + 3.1415927;
  float radius = length(local);
  float spiralRadius = 0.08 + angle * 0.058;
  float secondTurn = 0.08 + (angle + 6.2831853) * 0.058;
  float spiralDistance = min(abs(radius - spiralRadius), abs(radius - secondTurn));
  float strand = smoothstep(0.055, 0.016, spiralDistance);
  float glow = exp(-spiralDistance * 14.0);
  float runner = pow(0.5 + 0.5 * sin(angle * 2.0 + radius * 21.0 - iTime * 4.2), 7.0);
  float frame = smoothstep(0.49, 0.45, max(abs(local.x), abs(local.y)));

  vec3 col = mix(uColBg, uColDim, frame * 0.28 + glow * 0.14);
  col = mix(col, uColInk, strand * 0.7);
  col = mix(col, uColSignal, strand * (0.4 + runner * 0.5));
  col += uColAccent * strand * runner * 0.72;
  col = mix(col, uColPaper, strand * runner * 0.32);

  fragColor = vec4(col, 1.0);
}
