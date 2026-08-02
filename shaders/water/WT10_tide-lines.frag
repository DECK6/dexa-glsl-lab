// Tide marks stacking up the beach. Each line arrives on its own clock,
// tints everything below it, and leaves its bright wet edge behind.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 col = mix(uColBg, uColInk, 0.16);
  float wetness = 0.0;

  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float speed = 0.09 + fi * 0.028;
    float y = mod(fi * 0.29 + iTime * speed + uSeed * 0.37, 2.6) - 1.3;
    y += 0.055 * sin(uv.x * (1.7 + fi * 0.6) + iTime * (0.5 + fi * 0.11) + fi);
    y += 0.018 * sin(uv.x * (6.0 + fi) - iTime * 0.9);

    float below = smoothstep(y + 0.008, y - 0.008, uv.y);
    col = mix(col, mix(uColInk, uColSignal, fi / 7.0), below * 0.22);
    wetness += below * 0.1;

    float line = exp(-abs(uv.y - y) * 44.0);
    col += mix(uColSignal, uColPaper, fract(fi * 0.41)) * line * 0.7;
    col += uColAccent * exp(-abs(uv.y - y) * 130.0) * 0.35;
  }

  col += uColSignal * wetness * 0.16;
  col = mix(col, uColBg, smoothstep(0.75, 1.15, abs(uv.y)) * 0.25);

  fragColor = vec4(col, 1.0);
}
