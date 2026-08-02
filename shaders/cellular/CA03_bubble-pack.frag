// Two lattices of soap bubbles drifting in place — rim-lit shells with a paper
// specular dot, packed close enough that they touch and slide past each other.

float hash21(vec2 p) {
  p = fract(p * vec2(191.71, 371.13) + fract(uSeed * 0.0000151) * 33.9);
  p += dot(p, p + 27.71);
  return fract(p.x * p.y);
}

vec3 bubbles(vec2 uv, float scale, float phase) {
  vec2 p = uv * scale + phase;
  vec2 base = floor(p);
  vec2 f = fract(p) - 0.5;
  vec3 acc = vec3(0.0);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      float h = hash21(base + g);
      float k = hash21(base + g + 9.0);
      vec2 c = f - g - 0.26 * vec2(sin(iTime * 0.6 + 6.2832 * h), cos(iTime * 0.5 + 6.2832 * k));
      float r = 0.20 + 0.24 * h;
      float d = length(c) - r;
      float shell = smoothstep(0.05, 0.0, abs(d));
      float inside = smoothstep(0.0, -0.16, d);
      acc += uColSignal * shell * (0.55 + 0.6 * k);
      acc += uColDim * inside * 0.22;
      acc += uColAccent * shell * smoothstep(0.78, 0.98, h) * 0.9;
      acc += uColPaper * smoothstep(0.10 * r, 0.0, length(c + vec2(0.45, 0.45) * r)) * 0.85;
    }
  }
  return acc;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

  vec3 col = mix(uColBg, uColInk, 0.6 - 0.35 * length(uv));
  col += bubbles(uv, 4.2, 0.0) * 0.9;
  col += bubbles(uv, 7.4, 31.7) * 0.55;

  fragColor = vec4(col, 1.0);
}
