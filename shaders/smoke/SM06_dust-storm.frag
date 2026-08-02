// A dust front crossing the frame: a billowing head wall with hard grain behind
// it, thin haze outrunning the gust, and a scoured layer dragging on the ground.

float hash21(vec2 p) {
  p = fract(p * vec2(179.23, 143.87) + uSeed * 0.71);
  p += dot(p, p + 45.61);
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
  for (int i = 0; i < 6; i++) {
    value += amp * vnoise(p);
    p = p * 2.13 + vec2(9.1, 27.3);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;
  float h = clamp(uv.y * 0.5 + 0.5, 0.0, 1.0);

  float sweep = -1.9 + mod(t * 0.45 + uSeed * 0.1, 3.8);
  float head = sweep + (fbm(vec2(uv.y * 2.2 + t * 0.35, t * 0.22)) - 0.5) * 0.75;
  float behind = smoothstep(head + 0.05, head - 0.7, uv.x);

  vec2 q = vec2(uv.x * 1.6 - t * 0.9, uv.y * 2.2 + t * 0.25);
  float grain = fbm(q + fbm(q * 2.3) * 0.6);

  float dust = behind * clamp(grain * 1.5 - 0.15, 0.0, 1.0) * mix(1.15, 0.5, h);
  float haze = smoothstep(head + 0.9, head, uv.x) * 0.24 * (0.5 + grain);
  float ground = smoothstep(-0.45, -1.0, uv.y) * (0.35 + 0.8 * grain);
  float total = clamp(dust + haze + ground * 0.6, 0.0, 1.4);

  vec3 col = uColBg;
  col = mix(col, uColDim, smoothstep(0.04, 0.45, total));
  col = mix(col, mix(uColDim, uColAccent, 0.45), smoothstep(0.42, 0.88, total));
  col = mix(col, uColPaper, smoothstep(0.95, 1.35, total) * 0.65);

  // Daylight still gets through just ahead of the wall.
  col += uColSignal * behind * (1.0 - behind) * 3.6 * 0.35;

  fragColor = vec4(col, 1.0);
}
