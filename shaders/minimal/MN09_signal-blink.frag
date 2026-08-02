// A vertical Morse-like stack passes one bright blink through dots and dashes.

float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float clock = mod(iTime * 1.75 + uSeed * 2.371, 7.0);
  float seedStep = floor(fract(uSeed * 1.73) * 3.0);
  vec3 col = mix(uColBg, uColDim, 0.12 + exp(-length(uv) * 1.8) * 0.1);

  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float y = (fi - 3.0) * 0.245;
    float dash = step(1.5, mod(fi + seedStep, 3.0));
    vec2 halfSize = mix(vec2(0.065, 0.065), vec2(0.25, 0.065), dash);
    float d = roundedBoxDistance(uv - vec2(0.0, y), halfSize, 0.055);
    float slotDistance = abs(clock - fi);
    slotDistance = min(slotDistance, 7.0 - slotDistance);
    float activation = exp(-slotDistance * slotDistance * 7.0);
    float glow = exp(-max(d, 0.0) * 15.0) * (0.18 + activation * 0.72);
    float core = 1.0 - smoothstep(-0.012, 0.018, d);
    col += mix(uColSignal, uColAccent, dash * 0.55) * glow * 0.55;
    col = mix(col, uColPaper, core * (0.28 + activation * 0.68));
  }

  fragColor = vec4(col, 1.0);
}
