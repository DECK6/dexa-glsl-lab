// Vertical bands sliding on their own sine phase. The frame stays whole
// horizontally, but every column reads the same rungs at a different point in
// the wave — and squeezes them while it does.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float bands = 13.0;
  float x = (uv.x + 1.4) * bands * 0.5;
  float id = floor(x);
  float f = fract(x);

  float phase = id * 0.62 + uSeed * 2.3;
  float shift = 0.42 * sin(iTime * 1.0 + phase) + 0.22 * sin(iTime * 0.43 + phase * 1.7);
  float squeeze = 1.0 + 0.35 * sin(iTime * 0.6 + phase * 0.8);

  vec2 w = vec2(uv.x, (uv.y + shift) * squeeze);

  float rung = smoothstep(0.36, 0.5, abs(fract(w.y * 4.5) - 0.5));
  float thin = smoothstep(0.46, 0.5, abs(fract(w.y * 18.0) - 0.5));
  float gutter = smoothstep(0.0, 0.07, min(f, 1.0 - f));
  float speed = abs(shift) * 1.5;

  vec3 col = mix(uColBg, uColInk, 0.3 + 0.5 * gutter);
  col = mix(col, uColDim * 0.85, thin * gutter * 0.6);
  col = mix(col, uColSignal, rung * gutter * 0.95);
  col = mix(col, uColAccent, rung * gutter * smoothstep(0.4, 0.85, speed));
  col = mix(col, uColPaper, rung * gutter * smoothstep(0.9, 1.05, squeeze) * 0.4);

  fragColor = vec4(col, 1.0);
}
