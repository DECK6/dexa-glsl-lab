// Metaball cells on a jittered lattice, each running its own mitosis clock:
// the body stretches, pinches at the waist and splits into two daughters.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45) + fract(uSeed * 0.0000191) * 27.3);
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 3.6;

  vec2 base = floor(uv);
  vec2 f = fract(uv) - 0.5;
  float dist = 8.0;
  float tone = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      float h = hash21(base + g);
      float j = hash21(base + g + 17.0);
      float cycle = fract(iTime * 0.20 + h);
      float split = smoothstep(0.10, 0.90, cycle);
      float angle = 6.2832 * j + iTime * 0.2;
      vec2 axis = vec2(cos(angle), sin(angle)) * 0.34 * split;
      vec2 c = f - g - (vec2(h, j) - 0.5) * 0.4;
      float r = 0.30 - 0.07 * split;
      float d = smin(length(c - axis) - r, length(c + axis) - r, 0.16 * (1.0 - split) + 0.02);
      if (d < dist) {
        dist = d;
        tone = j;
      }
    }
  }

  float body = smoothstep(0.03, -0.03, dist);
  float membrane = smoothstep(0.09, 0.0, abs(dist));
  float nucleus = smoothstep(-0.13, -0.21, dist);

  vec3 col = mix(uColBg, uColInk, 0.7);
  col = mix(col, mix(uColDim, uColSignal * 0.35, tone), body);
  col = mix(col, uColSignal, membrane);
  col = mix(col, uColAccent, nucleus * (0.5 + 0.5 * sin(iTime * 1.6 + 8.0 * tone)));

  fragColor = vec4(col, 1.0);
}
