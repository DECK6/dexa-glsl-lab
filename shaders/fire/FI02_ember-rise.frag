// Embers carried by the updraft: three parallax layers of hashed particles
// scrolling upward, each a warm halo around a white-hot grain.

float hash21(vec2 p) {
  p = fract(p * vec2(211.71, 317.13) + uSeed * 0.53);
  p += dot(p, p + 41.7);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // the fire bed sits below the frame and warms the lower air
  vec3 col = mix(uColBg, uColInk, smoothstep(1.1, -1.1, uv.y));
  col += uColAccent * 0.42 * exp(-(uv.y + 1.05) * 2.4);
  col += uColAccent * 0.10 * exp(-(uv.y + 1.05) * 0.9);

  float glow = 0.0;
  float core = 0.0;

  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = 4.5 + fi * 3.2;
    vec2 p = uv * scale;
    p.y += iTime * (1.1 + fi * 0.7);
    p.x += sin(p.y * 0.5 + fi * 2.0 + iTime * 0.6) * 0.5;

    vec2 cell = floor(p);
    vec2 f = fract(p) - 0.5;
    float rnd = hash21(cell + fi * 19.0);
    float on = step(0.6, rnd);
    vec2 off = vec2(hash21(cell + 3.7), hash21(cell + 8.1)) - 0.5;
    float d = length((f - off * 0.7) * vec2(1.0, 1.5));

    float size = 0.045 + 0.05 * rnd;
    float life = smoothstep(1.15, -1.0, uv.y) * (0.45 + 0.55 * rnd);
    float dim = 1.0 / (1.0 + fi * 0.6);

    glow += on * life * dim * exp(-d * 9.0) * 0.9;
    core += on * life * dim * smoothstep(size, size * 0.25, d);
  }

  col = mix(col, uColAccent, clamp(glow * 1.5, 0.0, 1.0));
  col += uColAccent * glow * 0.6;
  col = mix(col, mix(uColAccent, uColPaper, 0.65), clamp(core * 1.2, 0.0, 1.0));
  col = mix(col, uColPaper, clamp(core - 0.55, 0.0, 1.0) * 1.8);

  fragColor = vec4(col, 1.0);
}
