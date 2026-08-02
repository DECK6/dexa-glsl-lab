// Rectangular gates stream from a moving vanishing point. Depth wraps at the
// camera, producing a continuous architectural tunnel without ray marching.

mat2 rotate2(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float boxFrame(vec2 p, vec2 halfSize, float width) {
  vec2 q = abs(p) - halfSize;
  float outside = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return exp(-abs(outside) / width);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 vanishing = vec2(sin(iTime * 0.29 + uSeed) * 0.2, cos(iTime * 0.23) * 0.15);
  vec3 col = mix(uColBg, uColInk, 0.45);
  float glow = 0.0;

  for (int i = 0; i < 11; i++) {
    float fi = float(i);
    float depth = fract(fi / 11.0 + iTime * 0.12);
    float scale = mix(0.08, 1.38, depth * depth);
    float angle = (depth - 0.5) * 0.25 + sin(iTime * 0.31 + fi) * 0.035;
    vec2 q = rotate2(angle) * (uv - vanishing * (1.0 - depth));
    float gate = boxFrame(q, vec2(scale, scale * 0.68), 0.014 + depth * 0.006);
    float brightness = smoothstep(0.0, 0.22, depth) * smoothstep(1.0, 0.72, depth);
    vec3 tint = mix(uColSignal, uColAccent, depth);
    col += tint * gate * brightness * 0.24;
    glow += gate * brightness;
  }

  col += uColDim * smoothstep(0.4, 2.0, glow) * 0.24;
  col = mix(col, uColPaper, smoothstep(2.1, 4.0, glow) * 0.45);
  col += uColSignal * exp(-length(uv - vanishing) * 13.0) * 0.25;
  fragColor = vec4(col, 1.0);
}
