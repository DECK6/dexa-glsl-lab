// Thermographic ramp over rising plumes: cold cyan at the fringes, through grey
// and orange, into white-hot paper at the crests. The whole field scrolls up.

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.7);
  p += dot(p, p + 41.17);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float plume(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p = p * 2.1 + vec2(5.2, 1.3);
    amp *= 0.5;
  }
  return v;
}

vec3 heat(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(uColBg, uColSignal, smoothstep(0.0, 0.30, t));
  c = mix(c, uColDim, smoothstep(0.26, 0.48, t));
  c = mix(c, uColAccent, smoothstep(0.46, 0.76, t));
  c = mix(c, uColPaper, smoothstep(0.78, 1.0, t));
  return c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y;

  // the vertical squash turns noise into columns; the scroll makes them rise
  vec2 p = vec2(uv.x * 4.2, uv.y * 1.5 - iTime * 0.42);
  float base = plume(p) * 1.15 + plume(p * 2.4 + vec2(0.0, iTime * 0.25)) * 0.35;
  float t = (base - 0.72) * 1.35 + 0.46 - uv.y * 0.16;

  // thin isotherm lines ride up through the ramp
  t += 0.045 * sin(t * 34.0 - iTime * 2.4);

  fragColor = vec4(heat(t), 1.0);
}
