// An elastic wall network: Voronoi borders drawn thick and soft, brightest where
// three cells meet, the whole mesh breathing in and out of the frame.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000143) * 36.1;
  p = vec2(dot(p, vec2(141.7, 289.3)), dot(p, vec2(233.1, 167.9)));
  return fract(sin(p) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float breathe = 1.0 + 0.16 * sin(iTime * 0.55);
  float a = iTime * 0.07;
  uv = mat2(cos(a), sin(a), -sin(a), cos(a)) * uv * (4.6 / breathe);

  vec2 base = floor(uv);
  vec2 f = fract(uv);
  float d1 = 8.0;
  float d2 = 8.0;
  float d3 = 8.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 h = hash22(base + g);
      vec2 p = g + 0.5 + 0.40 * sin(iTime * 0.45 + 6.2832 * h);
      float d = length(p - f);
      if (d < d1) {
        d3 = d2;
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d3 = d2;
        d2 = d;
      } else if (d < d3) {
        d3 = d;
      }
    }
  }

  float wall = smoothstep(0.20, 0.02, d2 - d1);
  float node = smoothstep(0.26, 0.05, d3 - d1);
  float pulse = 0.55 + 0.45 * sin(length(uv) * 2.4 - iTime * 2.0);

  vec3 col = mix(uColBg, uColInk, 0.65);
  col = mix(col, uColPaper * (0.35 + 0.45 * pulse), wall);
  col = mix(col, uColSignal, node * 0.85);
  col += uColAccent * node * pulse * 0.5;

  fragColor = vec4(col, 1.0);
}
