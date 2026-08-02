// Two square grids at a hair of relative twist and scale, sliding past each
// other. Their product beats into a checkerboard of moire cells that swells
// and shrinks as the twist opens and closes.

vec2 rot(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c) * p;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float twist = 0.060 + 0.055 * sin(iTime * 0.19 + uSeed);
  vec2 drift = vec2(iTime * 0.9, iTime * 0.5);

  vec2 q1 = uv * 126.0 + drift;
  vec2 q2 = rot(uv, twist) * 130.0 - drift;

  float g1 = sin(q1.x) * sin(q1.y);
  float g2 = sin(q2.x) * sin(q2.y);
  vec2 d = q1 - q2;
  float beat = cos(d.x) * cos(d.y);

  float mesh = smoothstep(0.1, 0.9, abs(g1)) * 0.5 + smoothstep(0.1, 0.9, abs(g2)) * 0.5;
  float cell = smoothstep(0.15, 0.95, beat);
  float anti = smoothstep(0.15, 0.95, -beat);

  vec3 col = mix(uColBg, uColInk, 0.55);
  col = mix(col, uColDim, mesh * 0.4);
  col = mix(col, uColSignal, mesh * cell);
  col = mix(col, uColAccent, mesh * anti * 0.85);
  col += uColPaper * smoothstep(0.55, 1.0, g1 * g2) * 0.5;

  fragColor = vec4(col, 1.0);
}
