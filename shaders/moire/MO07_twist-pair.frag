// A counter-wound spiral pair: same hub, opposite twist, mismatched radial
// pitch. The mismatch turns the crossing into a slow pinwheel whose arms
// migrate outward while the whole rig rotates.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float r = length(uv);
  float th = atan(uv.y, uv.x) + iTime * 0.12 + uSeed;

  float arms = 11.0;
  float pitch = 104.0;
  float pa = r * pitch + th * arms - iTime * 2.4;
  float pb = r * (pitch * 1.17) - th * arms - iTime * 1.6;

  float damp = smoothstep(0.03, 0.26, r);
  float fringe = sin(pa) * sin(pb);
  float lit = smoothstep(-0.1, 0.85, fringe) * damp;
  float band = smoothstep(-0.2, 0.95, cos(pa - pb));

  vec3 col = mix(uColBg, uColInk, 0.6);
  col = mix(col, uColAccent, lit * (0.25 + 0.7 * band));
  col = mix(col, uColSignal, lit * pow(1.0 - band, 3.0) * 0.9);
  col = mix(col, uColPaper, lit * band * band * 0.4);
  col += uColAccent * exp(-r * 9.0) * 0.6;

  fragColor = vec4(col, 1.0);
}
