// Pool bottom seen through moving water: a folded-sine caustic mesh slides
// over the tile grout, and the view of the floor bends with the swell.

float caustic(vec2 p, float t) {
  float c = 0.0;
  float weight = 0.5;
  for (int n = 0; n < 5; n++) {
    float fn = float(n);
    vec2 fold = vec2(
      sin(p.y * 1.17 + t * (0.7 + fn * 0.11)),
      cos(p.x * 1.31 - t * (0.9 + fn * 0.07))
    );
    p = p * 1.43 + fold * 1.25 + vec2(2.7, -1.9);
    float crossing = abs(sin(p.x + cos(p.y)) * cos(p.y + sin(p.x)));
    c += exp(-crossing * 13.0) * weight;
    weight *= 0.66;
  }
  return smoothstep(0.22, 1.18, c);
}

float grout(vec2 p) {
  vec2 g = abs(fract(p) - 0.5);
  return smoothstep(0.38, 0.5, max(g.x, g.y));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  // refraction through the surface displaces everything on the floor
  vec2 bend = vec2(
    sin(uv.y * 4.3 + iTime * 0.9) + 0.4 * sin(uv.x * 7.1 - iTime * 1.3),
    cos(uv.x * 3.7 - iTime * 0.7) + 0.4 * cos(uv.y * 6.3 + iTime * 1.1)
  ) * 0.03;

  float tiles = grout((uv + bend) * 3.0 + vec2(0.13, 0.07));
  float c = caustic((uv + bend) * 5.5 + uSeed, iTime * 0.55 + 23.0);

  vec3 col = mix(uColBg, uColInk, 0.45);
  col = mix(col, uColDim, tiles * 0.9);
  col += uColSignal * tiles * 0.12;
  col = mix(col, uColSignal, c * 0.95);
  col = mix(col, uColPaper, smoothstep(0.55, 0.95, c));
  col += uColAccent * smoothstep(0.78, 1.0, c) * 0.45;

  fragColor = vec4(col, 1.0);
}
