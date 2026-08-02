// A wandering source pulls a diagonal optical axis through the frame.
// Rings, discs, and anamorphic streaks trail it as a chain of lens ghosts.

float flareDisc(vec2 p, float radius, float softness) {
  return smoothstep(radius, radius - softness, length(p));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 source = vec2(
    0.78 * sin(iTime * 0.31 + uSeed * 3.7 + 0.4),
    0.52 * cos(iTime * 0.23 + uSeed * 2.1)
  );
  vec2 axis = normalize(source + vec2(0.001, 0.002));
  float glow = 0.025 / (0.025 + dot(uv - source, uv - source));
  float ghosts = 0.0;
  float rings = 0.0;

  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float along = mix(-0.92, 0.62, fi / 7.0);
    vec2 centre = -source * along;
    float radius = 0.035 + 0.018 * mod(fi, 3.0);
    float d = length(uv - centre);
    ghosts += smoothstep(radius, radius * 0.35, d) * (0.35 + 0.08 * fi);
    rings += exp(-pow((d - radius * 1.9) * 42.0, 2.0)) * mod(fi + 1.0, 2.0);
  }

  float streak = exp(-pow(dot(uv - source, vec2(-axis.y, axis.x)) * 32.0, 2.0));
  streak *= exp(-length(uv - source) * 0.65);
  float iris = flareDisc(uv - source, 0.11, 0.08);

  vec3 col = mix(uColBg, uColInk, 0.30);
  col += uColSignal * (ghosts * 0.32 + streak * 0.72);
  col += uColAccent * (rings * 0.52 + ghosts * 0.11);
  col += uColPaper * (glow * 1.45 + iris * 0.62);
  fragColor = vec4(col, 1.0);
}
