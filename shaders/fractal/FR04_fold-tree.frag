// A binary branch tree grown by folding: draw a trunk segment, hop to its tip,
// mirror the plane and rotate, then rescale. Nine levels give 512 twigs. The
// branch angle carries a per-level wind term so the whole crown sways.

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

float sdSeg(vec2 p, vec2 b) {
  float h = clamp(dot(p, b) / dot(b, b), 0.0, 1.0);
  return length(p - b * h);
}

float treeDist(vec2 p, float t) {
  float d = 1e9;
  float scale = 1.0;
  for (int i = 0; i < 9; i++) {
    float wind = 0.14 * sin(t * 0.9 + float(i) * 0.8 + uSeed);
    d = min(d, (sdSeg(p, vec2(0.0, 0.34)) - 0.030) * scale);
    p.y -= 0.34;
    p.x = abs(p.x);
    p = rot(0.40 + wind) * p;
    p /= 0.78;
    scale *= 0.78;
  }
  return d;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 0.95 + vec2(0.0, 0.80);

  float d = treeDist(p, iTime);
  float crown = smoothstep(0.35, 1.45, p.y);

  vec3 col = mix(uColBg, uColInk, 0.45 + 0.40 * smoothstep(-1.0, 1.0, uv.y));
  col += uColSignal * exp(-abs(d) * 6.0) * 0.20;
  col += uColSignal * exp(-abs(d) * 40.0) * 0.70;
  col = mix(col, uColPaper, smoothstep(0.005, 0.0, d));
  col += uColAccent * exp(-abs(d) * 110.0) * crown * (0.45 + 0.35 * sin(iTime * 1.3));

  fragColor = vec4(col, 1.0);
}
