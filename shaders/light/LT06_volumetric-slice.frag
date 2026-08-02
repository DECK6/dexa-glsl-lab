// Perspective light slabs advance from a narrow horizon toward the viewer.
// Each translucent slice carries a bright rim and a shifting internal grain.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float slabSignal = 0.0;
  float slabAccent = 0.0;
  float rims = 0.0;

  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float z = fract(fi / 9.0 + iTime * 0.095 + uSeed * 0.17);
    float y = mix(0.78, -1.12, z * z);
    float thickness = mix(0.015, 0.13, z);
    float halfWidth = mix(0.18, 1.34, z);
    float skew = uv.x + uv.y * (0.12 + 0.04 * sin(fi + uSeed));
    float lateral = smoothstep(halfWidth, halfWidth - 0.12, abs(skew));
    float distanceToSlab = abs(uv.y - y);
    float body = smoothstep(thickness, 0.0, distanceToSlab) * lateral;
    float rim = exp(-pow((distanceToSlab - thickness) * mix(120.0, 32.0, z), 2.0)) * lateral;
    float grain = 0.72 + 0.28 * sin(skew * 28.0 + fi * 4.1 - iTime * 1.4);
    slabSignal += body * grain * (1.0 - mod(fi, 2.0));
    slabAccent += body * grain * mod(fi, 2.0);
    rims += rim;
  }

  float volume = exp(-abs(uv.x + uv.y * 0.12) * 1.25) * smoothstep(-1.0, 0.85, uv.y);
  vec3 col = mix(uColBg, uColInk, 0.42 + volume * 0.18);
  col += uColSignal * (slabSignal * 0.54 + volume * 0.10);
  col += uColAccent * slabAccent * 0.48;
  col += uColPaper * rims * 0.36;
  fragColor = vec4(col, 1.0);
}
