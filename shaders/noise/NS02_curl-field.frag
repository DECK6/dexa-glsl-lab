// The curl of a scalar noise potential is divergence-free, so its integral
// curves never sink into a point. Every pixel walks that field for a dozen
// steps and smears a moving phase along the path, which paints the streamlines.

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.37);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float potential(vec2 p) {
  return vnoise(p) + 0.5 * vnoise(p * 2.3 + 4.1);
}

vec2 curl(vec2 p) {
  float e = 0.06;
  float dx = potential(p + vec2(e, 0.0)) - potential(p - vec2(e, 0.0));
  float dy = potential(p + vec2(0.0, e)) - potential(p - vec2(0.0, e));
  return vec2(dy, -dx) / (2.0 * e);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 1.6 + vec2(0.0, iTime * 0.04);

  float acc = 0.0;
  float wsum = 0.0;
  vec2 q = p;
  for (int i = 0; i < 12; i++) {
    vec2 v = curl(q);
    q += v / (length(v) + 0.001) * 0.055;
    float phase = vnoise(q * 4.0) * 20.0 - iTime * 4.5;
    float w = 1.0 - float(i) / 12.0;
    acc += (0.5 + 0.5 * sin(phase)) * w;
    wsum += w;
  }
  acc /= wsum;

  float speed = clamp(length(curl(p)) * 0.45, 0.0, 1.0);
  float streak = smoothstep(0.34, 0.86, acc);

  vec3 col = mix(uColBg, uColInk, 0.3 + 0.7 * speed);
  col += uColSignal * streak * (0.45 + 0.8 * speed);
  col += uColAccent * pow(streak, 3.0) * speed * 1.1;
  col = mix(col, uColPaper, pow(streak, 7.0) * 0.4);
  fragColor = vec4(col, 1.0);
}
