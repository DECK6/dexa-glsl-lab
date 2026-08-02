// Ink pools whose boundary keeps wicking outward. Fibres break the edge up and
// the fringe separates into cyan ahead of the front, orange behind it.

float hash21(vec2 p) {
  p = fract(p * vec2(211.7, 97.3) + uSeed * 1.3);
  p += dot(p, p + 27.61);
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
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * vnoise(p);
    p = p * 2.03 + vec2(3.1, 6.7);
    amp *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // a slow warp keeps the pools alive; fine noise supplies the capillaries
  vec2 w = vec2(fbm(uv * 1.3 + iTime * 0.05), fbm(uv * 1.3 + 4.7 - iTime * 0.04));
  float pool = fbm(uv * 1.7 + (w - 0.5) * 1.6);
  float fibre = fbm(uv * 9.0 + w * 2.0) - 0.5;

  float front = 0.50 + 0.085 * sin(iTime * 0.55) - 0.02 * length(uv);
  float d = pool + fibre * 0.09 - front;

  float core = smoothstep(0.015, -0.02, d);
  float lead = smoothstep(0.11, 0.0, abs(d - 0.055));
  float trail = smoothstep(0.13, 0.0, abs(d + 0.06));

  vec3 col = uColBg;
  col = mix(col, uColDim, smoothstep(0.30, 0.0, abs(d)) * 0.45);
  col += uColSignal * lead * 0.55;
  col += uColAccent * trail * 0.45;
  col = mix(col, uColPaper, core * 0.92);

  fragColor = vec4(col, 1.0);
}
