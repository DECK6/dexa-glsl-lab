// Four chimney stacks carry different trains of puffs. Hot columns rise
// straight at first, then crosswind separates them into overlapping lobes.

float hash21(vec2 p) {
  p = fract(p * vec2(211.71, 317.13) + uSeed * 0.23);
  p += dot(p, p + 41.7);
  return fract(p.x * p.y);
}

float boxDistance(vec2 p, vec2 halfSize) {
  vec2 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float density = 0.0;
  float heat = 0.0;
  float stacks = 0.0;

  for (int column = 0; column < 4; column++) {
    float fc = float(column);
    float x = -0.72 + fc * 0.48;
    float height = 0.24 + 0.08 * mod(fc, 2.0);
    float stack = 1.0 - smoothstep(-0.015, 0.025,
      boxDistance(uv - vec2(x, -0.82 + height), vec2(0.095, height)));
    stacks = max(stacks, stack);

    for (int puffIndex = 0; puffIndex < 6; puffIndex++) {
      float fp = float(puffIndex);
      float life = fract(iTime * (0.17 + fc * 0.015) + fp / 6.0 + fc * 0.13 + uSeed * 0.03);
      float rnd = hash21(vec2(fc, fp));
      vec2 centre = vec2(x, -0.56 + height * 2.0);
      centre.y += life * 1.55;
      centre.x += life * life * (0.22 + fc * 0.035) + sin(life * 7.0 + rnd * 8.0) * 0.05;
      float radius = 0.035 + life * 0.19 + rnd * 0.035;
      vec2 q = (uv - centre) / vec2(radius * (1.0 + life * 0.8), radius);
      float puff = exp(-dot(q, q) * 1.6);
      float fade = smoothstep(0.0, 0.08, life) * smoothstep(1.0, 0.62, life);
      density += puff * fade * (0.6 + rnd * 0.55);
      heat += puff * fade * pow(1.0 - life, 4.0);
    }
  }

  vec3 col = mix(uColBg, uColInk, smoothstep(1.0, -0.6, uv.y) * 0.45);
  col = mix(col, uColDim, stacks * 0.82);
  col = mix(col, uColDim, smoothstep(0.06, 0.7, density));
  col = mix(col, uColPaper, smoothstep(0.72, 1.65, density) * 0.78);
  col += uColSignal * heat * 0.28;
  col += uColAccent * heat * stacks * 0.5;

  fragColor = vec4(col, 1.0);
}
