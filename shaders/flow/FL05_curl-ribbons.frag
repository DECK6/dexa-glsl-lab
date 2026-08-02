// A finite-difference curl field advects the domain without divergence.
// Thin fbm contours survive the trip as folded, drifting ribbons.

float fl05Hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423) + uSeed * 0.137);
  p += dot(p, p.yx + 19.19);
  return fract(p.x * p.y);
}

float fl05Noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = fl05Hash(i);
  float b = fl05Hash(i + vec2(1.0, 0.0));
  float c = fl05Hash(i + vec2(0.0, 1.0));
  float d = fl05Hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fl05Fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 5; i++) {
    sum += fl05Noise(p) * amp;
    p = mat2(1.63, -1.17, 1.17, 1.63) * p + vec2(4.3, 7.1);
    amp *= 0.49;
  }
  return sum;
}

vec2 fl05Curl(vec2 p, float t) {
  float e = 0.018;
  vec2 drift = vec2(t * 0.07, -t * 0.05);
  float dx = fl05Fbm(p + vec2(e, 0.0) + drift) - fl05Fbm(p - vec2(e, 0.0) + drift);
  float dy = fl05Fbm(p + vec2(0.0, e) + drift) - fl05Fbm(p - vec2(0.0, e) + drift);
  return vec2(dy, -dx) / (2.0 * e);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + uSeed * 0.31;
  vec2 q = uv * 1.55 + vec2(uSeed * 0.09, 0.0);
  float curlEnergy = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 flow = fl05Curl(q * 1.15, t + float(i) * 0.035);
    curlEnergy += min(length(flow), 2.0);
    q += flow * 0.024;
  }

  float field = fl05Fbm(q * 1.75 - vec2(t * 0.08, t * 0.035));
  float contour = abs(fract(field * 9.0) - 0.5);
  float ribbon = 1.0 - smoothstep(0.025, 0.105, contour);
  float knots = 1.0 - smoothstep(0.08, 0.24, abs(sin(field * 31.0 + t)));
  float energy = curlEnergy / 24.0;

  vec3 col = mix(uColBg, uColInk, 0.15 + field * 0.30);
  col += uColSignal * ribbon * (0.62 + energy);
  col += uColAccent * ribbon * knots * energy * 0.85;
  col += uColPaper * ribbon * smoothstep(0.55, 0.9, energy) * 0.45;
  fragColor = vec4(col, 1.0);
}
