// Coral in log-polar space: the cell grid wraps the angle exactly, so blobs
// branch and widen as they drift outward from the colony centre, tips blinking.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000211) * 47.8;
  p = vec2(dot(p, vec2(159.3, 271.7)), dot(p, vec2(113.9, 337.1)));
  return fract(sin(p) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  const float ARMS = 16.0;

  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = max(length(uv), 0.015);
  float a = atan(uv.y, uv.x);
  vec2 lp = vec2(a / 6.2832 * ARMS, -log(r) * 2.1 + iTime * 0.45);

  vec2 base = floor(lp);
  vec2 f = fract(lp);
  float d1 = 8.0;
  float tone = 0.0;
  float beat = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 h = hash22(vec2(mod(base.x + g.x, ARMS), base.y + g.y));
      vec2 p = g + 0.5 + 0.36 * sin(iTime * 0.5 + 6.2832 * h);
      float d = length((p - f) * vec2(0.9, 1.0));
      if (d < d1) {
        d1 = d;
        tone = h.x;
        beat = h.y;
      }
    }
  }

  float branch = smoothstep(0.62, 0.16, d1);
  float tip = smoothstep(0.30, 0.05, d1);
  float blink = 0.45 + 0.55 * sin(iTime * 2.4 + 6.2832 * beat);

  vec3 col = mix(uColBg, uColInk, 0.5 + 0.5 * smoothstep(0.8, 0.0, r));
  col = mix(col, mix(uColDim, uColSignal * 0.55, tone), branch);
  col = mix(col, uColSignal, tip * 0.55 * blink);
  col += uColAccent * tip * smoothstep(0.55, 0.9, tone) * blink * 0.9;
  col += uColPaper * branch * 0.08;

  fragColor = vec4(col, 1.0);
}
