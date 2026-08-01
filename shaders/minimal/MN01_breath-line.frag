// One horizontal line, breathing. Thickness, glow, and a slow horizontal
// scan are the only moving parts — restraint is the point.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float breath = 0.5 + 0.5 * sin(iTime * 0.8 + uSeed);
  float thickness = mix(0.004, 0.05, breath);

  float wave = sin(uv.x * 3.0 + iTime * 0.6) * 0.08 * breath;
  float d = abs(uv.y - wave);

  float core = smoothstep(thickness, 0.0, d);
  float glow = exp(-d * 9.0) * (0.25 + 0.55 * breath);

  // A slow scan pulse travels the line and flares it with accent.
  float scan = exp(-pow((uv.x - sin(iTime * 0.35) * 1.2) * 3.0, 2.0));

  vec3 col = uColBg;
  col = mix(col, uColSignal, glow);
  col = mix(col, uColPaper, core);
  col += uColAccent * scan * glow * 1.4;

  fragColor = vec4(col, 1.0);
}
