// Newton's method chasing the three cube roots of unity. Each pixel is coloured
// by the root it falls into and shaded by how long it took, so the three basins
// meet along an infinitely detailed edge. Over-relaxing the step past 1.0 makes
// that edge boil while the whole plane turns.

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
  float d = max(dot(b, b), 1e-6);
  return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d;
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 z = rot(iTime * 0.10) * uv * 1.7;

  vec2 r0 = vec2(1.0, 0.0);
  vec2 r1 = vec2(-0.5, 0.8660254);
  vec2 r2 = vec2(-0.5, -0.8660254);
  float relax = 1.0 + 0.32 * sin(iTime * 0.45 + uSeed);

  float iter = 0.0;
  for (int i = 0; i < 32; i++) {
    vec2 z2 = cmul(z, z);
    z -= relax * cdiv(cmul(z2, z) - vec2(1.0, 0.0), 3.0 * z2);
    if (min(min(distance(z, r0), distance(z, r1)), distance(z, r2)) < 0.002) break;
    iter += 1.0;
  }

  float d0 = distance(z, r0);
  float d1 = distance(z, r1);
  float d2 = distance(z, r2);
  vec3 base = uColSignal;
  if (d1 < d0 && d1 <= d2) base = uColAccent;
  if (d2 < d0 && d2 < d1) base = uColPaper;

  float shade = 1.0 - iter / 32.0;
  float band = 0.5 + 0.5 * cos(iter * 1.1 - iTime * 1.6);

  vec3 col = mix(uColBg, base * (0.40 + 0.60 * band), 0.22 + 0.78 * pow(shade, 1.3));
  col = mix(col, uColInk, smoothstep(0.35, 0.0, shade) * 0.65);
  col += uColPaper * smoothstep(0.80, 1.0, band) * (1.0 - shade) * 0.45;

  fragColor = vec4(col, 1.0);
}
