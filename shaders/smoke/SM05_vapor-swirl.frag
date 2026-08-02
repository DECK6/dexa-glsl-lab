// A vortex that winds itself up and lets go: the sampling angle twists by 1/r,
// so vapour shears into spiral arms whenever the pulse tightens, then slackens.

float hash21(vec2 p) {
  p = fract(p * vec2(151.77, 233.41) + uSeed * 0.43);
  p += dot(p, p + 37.19);
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
    p = p * 2.09 + vec2(17.9, 4.3);
    amp *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime;
  float r = length(uv);
  float a = atan(uv.y, uv.x + 1e-6);

  float pulse = 0.5 + 0.5 * sin(t * 0.55 + uSeed);
  float twist = (1.9 + 2.6 * pulse) / (r + 0.32);
  float ang = a + twist - t * 0.65;
  vec2 q = vec2(cos(ang), sin(ang)) * r * 2.4;

  float warp = fbm(q * 0.9 + t * 0.05);
  float dens = fbm(q + warp * 0.8);

  float arms = 0.55 + 0.45 * sin(ang * 3.0 + r * 5.0);
  float shell = smoothstep(1.25, 0.1, r);
  float vapor = clamp((dens - 0.26) * 2.3, 0.0, 1.0) * arms * shell;

  vec3 col = uColBg;
  col = mix(col, uColDim, smoothstep(0.05, 0.45, vapor));
  col = mix(col, uColPaper, smoothstep(0.45, 0.9, vapor) * 0.8);
  col = mix(col, uColSignal, smoothstep(0.55, 0.88, vapor) * 0.35);

  // Low-pressure eye at the centre, brightest while the swirl is tight.
  col += uColSignal * exp(-r * r * 16.0) * (0.55 + 0.5 * pulse);
  col += uColAccent * exp(-r * r * 60.0) * pulse * 0.8;

  fragColor = vec4(col, 1.0);
}
