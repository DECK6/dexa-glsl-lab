// Two ring sources drifting around each other. Multiplying the ring systems
// gives Young fringes: dense hyperbolas between the pair, opening into wide
// beat bands out at the rim. The slight pitch mismatch keeps the rim alive.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float spin = iTime * 0.16 + uSeed * 1.7;
  float sep = 0.30 + 0.17 * sin(iTime * 0.29);
  vec2 dir = vec2(cos(spin), sin(spin));

  float k = 102.0;
  float travel = iTime * 3.4;
  float pa = length(uv - dir * sep) * k - travel;
  float pb = length(uv + dir * sep) * (k * 1.07) - travel;

  float fringe = sin(pa) * sin(pb);
  float beat = cos(pa - pb);

  float lit = smoothstep(0.02, 0.85, fringe);
  float band = smoothstep(-0.15, 0.95, beat);

  vec3 col = mix(uColBg, uColDim, 0.20 * band);
  col = mix(col, uColSignal, lit * (0.30 + 0.70 * band));
  col = mix(col, uColPaper, lit * band * band * 0.5);
  col += uColAccent * pow(band, 4.0) * (0.18 + 0.55 * lit);

  // Both sources sit in a soft halo so the hubs read as emitters.
  float halo = exp(-length(uv - dir * sep) * 7.0) + exp(-length(uv + dir * sep) * 7.0);
  col += uColAccent * halo * 0.35;

  fragColor = vec4(col, 1.0);
}
