float lifeAt(vec2 uv) {
  return step(0.5, texture(iChannel0, fract(uv)).r);
}

float lifeHash(vec2 cell) {
  return fract(sin(dot(cell + uSeed, vec2(91.7, 157.3))) * 43758.5453);
}

void mainBuffer(out vec4 state, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 texel = 1.0 / iChannelResolution[0].xy;
  if (iFrame == 0) {
    vec2 cell = floor(fragCoord / 3.0);
    float seedLife = step(0.68, lifeHash(cell));
    float ring = step(abs(length(uv - 0.5) - 0.23), 0.018);
    state = vec4(max(seedLife, ring), 0.0, 0.0, 1.0);
    return;
  }

  float neighbors = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      if (x == 0 && y == 0) continue;
      neighbors += lifeAt(uv + vec2(float(x), float(y)) * texel);
    }
  }
  float alive = lifeAt(uv);
  float born = (1.0 - alive) * step(2.5, neighbors) * step(neighbors, 3.5);
  float survives = alive * step(1.5, neighbors) * step(neighbors, 3.5);
  float nextLife = max(born, survives);
  float age = nextLife * min(1.0, texture(iChannel0, uv).g + 0.035);
  state = vec4(nextLife, age, born, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec4 state = texture(iChannel0, uv);
  float grid = smoothstep(0.08, 0.0, min(fract(fragCoord.x / 3.0), fract(fragCoord.y / 3.0)));
  vec3 col = mix(uColBg, uColInk, 0.25 + 0.22 * grid);
  col = mix(col, uColSignal, state.r * (0.55 + 0.45 * state.g));
  col = mix(col, uColAccent, state.b * (0.72 + 0.28 * sin(iTime * 3.0)));
  col += uColPaper * state.r * state.g * 0.18;
  fragColor = vec4(col, 1.0);
}
