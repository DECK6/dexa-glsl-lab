// Dozens of seeded particles precess on elliptical orbits. Short capsule
// trails preserve their direction while soft splats build a dense swarm.

float fl08Hash(float p) {
  return fract(sin(p * 127.1 + uSeed * 53.17) * 43758.5453);
}

mat2 fl08Rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float fl08Segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.68 + uSeed * 0.47;
  float cyan = 0.0;
  float orange = 0.0;
  float cores = 0.0;

  for (int i = 0; i < 34; i++) {
    float fi = float(i);
    float radius = 0.16 + fl08Hash(fi * 1.13 + 1.0) * 0.72;
    float speed = 0.18 + fl08Hash(fi * 2.71 + 2.0) * 0.72;
    float direction = mod(fi, 3.0) < 1.0 ? -1.0 : 1.0;
    float phase = fl08Hash(fi * 4.17 + 3.0) * 6.283 + t * speed * direction;
    float tilt = (fl08Hash(fi * 7.31 + 4.0) - 0.5) * 2.3 + sin(t * 0.17) * 0.18;
    vec2 pos = fl08Rotate(tilt) * vec2(cos(phase), sin(phase) * 0.62) * radius;
    vec2 prev = fl08Rotate(tilt) * vec2(cos(phase - direction * 0.16), sin(phase - direction * 0.16) * 0.62) * radius;
    float d = length(uv - pos);
    float trailD = fl08Segment(uv, prev, pos);
    float glow = exp(-d * d * 230.0) + exp(-trailD * trailD * 780.0) * 0.22;
    float core = exp(-d * d * 1800.0);
    float kind = step(0.54, fl08Hash(fi * 9.91 + 5.0));
    cyan += glow * (1.0 - kind);
    orange += glow * kind;
    cores += core;
  }

  float rings = 1.0 - smoothstep(0.025, 0.08, abs(sin(length(uv) * 22.0 - t * 0.45)));
  vec3 col = mix(uColBg, uColInk, rings * 0.20);
  col += uColSignal * cyan * 0.88;
  col += uColAccent * orange * 0.92;
  col += uColPaper * cores * 0.70;
  fragColor = vec4(col, 1.0);
}
