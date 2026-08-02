// A caustic is where a light sheet folds onto itself. Sharpening the h = 0.5
// level set of an fbm gives one thin sheet; three of them at different scales
// drift across each other, and the crossings are where brightness piles up.

float hash21(vec2 p) {
  p = fract(p * vec2(157.31, 419.77) + uSeed * 0.31);
  p += dot(p, p + 23.87);
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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.11 + vec2(2.6, 8.4);
    a *= 0.5;
  }
  return v;
}

float sheet(vec2 p, float t) {
  vec2 w = vec2(sin(t * 0.31), cos(t * 0.27)) * 0.5;
  float h = fbm(p + w);
  return pow(clamp(1.0 - abs(h - 0.5) * 2.4, 0.0, 1.0), 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y * 1.6 + uSeed * 0.2;
  float t = iTime;

  float a = sheet(uv * 1.05, t);
  float b = sheet(uv * 1.55 + 9.2, -t * 0.8);
  float c = sheet(uv * 0.72 - 4.5, t * 0.55);
  float net = a + b + c;
  float knot = a * b + b * c + c * a;

  float depth = fbm(uv * 0.8 + vec2(0.0, t * 0.05));

  vec3 col = mix(uColBg, uColInk, 0.25 + 0.75 * depth);
  col += uColSignal * net * 0.85;
  col += uColPaper * clamp(net - 0.6, 0.0, 1.0) * 0.7;
  col += uColAccent * knot * 3.0;
  fragColor = vec4(col, 1.0);
}
