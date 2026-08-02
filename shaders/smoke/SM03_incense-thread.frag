// One incense thread: laminar and hair-thin at the ember, wobbling as it climbs,
// fraying into puffs once the rise turns turbulent near the top.

float hash21(vec2 p) {
  p = fract(p * vec2(163.31, 271.09) + uSeed * 0.19);
  p += dot(p, p + 29.77);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * vnoise(p);
    p = p * 2.07 + vec2(3.9, 11.3);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;
  float h = clamp((uv.y + 0.95) * 0.55, 0.0, 1.0);

  float wobble = sin(uv.y * 3.4 - t * 1.7) * 0.07 * h
               + sin(uv.y * 8.1 - t * 2.6 + uSeed) * 0.035 * h * h;
  float turb = (fbm(vec2(uv.y * 2.6 - t * 0.55, t * 0.18)) - 0.5) * 1.4;
  float cx = wobble + turb * h * h * 0.55;

  float w = 0.008 + 0.16 * h * h;
  float dx = (uv.x - cx) / w;
  float core = exp(-dx * dx);
  float halo = exp(-abs(dx) * 0.55) * 0.45;

  float fray = mix(1.0, fbm(vec2(uv.x * 3.2, uv.y * 3.0 - t * 0.9)) * 2.1,
                   smoothstep(0.25, 1.0, h));
  float thread = (core + halo) * fray * mix(1.0, 0.55, h) * smoothstep(-0.97, -0.9, uv.y);

  // Faint room haze so the frame is not pure background around the thread.
  float haze = fbm(vec2(uv.x * 1.2 + t * 0.05, uv.y * 1.2 - t * 0.12)) * 0.3;

  vec3 col = uColBg;
  col = mix(col, uColDim, haze * smoothstep(1.0, -0.5, uv.y) * 0.55);
  col = mix(col, uColDim, smoothstep(0.05, 0.4, thread));
  col = mix(col, uColSignal, smoothstep(0.35, 0.9, thread) * 0.7);
  col = mix(col, uColPaper, smoothstep(0.85, 1.6, thread));

  vec2 e = uv - vec2(0.0, -0.95);
  float pulse = 0.6 + 0.4 * sin(t * 3.1 + uSeed);
  col += uColAccent * (exp(-dot(e, e) * 260.0) * 2.2 + exp(-dot(e, e) * 22.0) * 0.5) * pulse;

  fragColor = vec4(col, 1.0);
}
