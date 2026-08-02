// Seeded coordinates are marched through a restless vector field.
// Repeated stripe samples gather into long, luminous stream bundles.

float fl01Hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed * 0.173);
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

vec2 fl01Field(vec2 p, float t) {
  vec2 v = vec2(
    sin(p.y * 2.4 + t * 0.43) + 0.45 * cos(p.x * 1.7 - t * 0.31),
    cos(p.x * 2.1 - t * 0.37) - 0.40 * sin(p.y * 1.9 + t * 0.27)
  );
  vec2 flow = v + vec2(0.55, 0.08);
  return flow / max(length(flow), 0.001);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + uSeed * 0.41;
  vec2 q = uv * 1.45 + vec2(fl01Hash(vec2(uSeed, 2.0)), uSeed * 0.07);

  float ribbons = 0.0;
  float glints = 0.0;
  for (int i = 0; i < 20; i++) {
    float fi = float(i);
    vec2 velocity = fl01Field(q, t + fi * 0.025);
    float phase = q.y * 20.0 + sin(q.x * 3.2 + t * 0.35) * 2.4;
    float stripe = abs(sin(phase + fl01Hash(floor(q * 2.0)) * 1.2));
    float gate = 0.55 + 0.45 * sin(q.x * 5.0 - t * 1.3 + fi * 0.17);
    ribbons += exp(-stripe * 34.0) * gate;
    glints += exp(-stripe * 95.0) * exp(-abs(q.x - 0.15) * 0.8);
    q += velocity * 0.048;
  }

  ribbons /= 7.0;
  glints /= 5.0;
  float haze = 0.08 + 0.12 * sin(uv.y * 9.0 + uv.x * 2.0 - t * 0.6);
  vec3 col = mix(uColBg, uColInk, max(haze, 0.0));
  col += uColSignal * ribbons * 1.25;
  col += uColAccent * glints * 0.65;
  col = mix(col, uColPaper, smoothstep(0.75, 1.45, glints));
  fragColor = vec4(col, 1.0);
}
