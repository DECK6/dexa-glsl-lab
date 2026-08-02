// Two spoke fans thrown from orbiting hubs. Where the fans graze each other
// the spokes braid into curved moire; each hub damps its own near-field so the
// convergence never turns to noise.

float spokePhase(vec2 p, float n, float phase) {
  return n * atan(p.y, p.x) + phase;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float orbit = iTime * 0.21 + uSeed * 2.3;
  vec2 hub = vec2(cos(orbit), sin(orbit)) * 0.42;
  vec2 p1 = uv - hub;
  vec2 p2 = uv + hub;

  float pa = spokePhase(p1, 33.0, iTime * 0.9);
  float pb = spokePhase(p2, 31.0, -iTime * 0.9);

  float damp = smoothstep(0.04, 0.30, length(p1)) * smoothstep(0.04, 0.30, length(p2));
  float fringe = sin(pa) * sin(pb);
  float lit = smoothstep(0.0, 0.85, fringe) * damp;
  float band = smoothstep(-0.1, 0.95, cos(pa - pb)) * damp;

  vec3 col = mix(uColBg, uColInk, 0.6);
  col = mix(col, uColDim, lit * 0.7);
  col = mix(col, uColSignal, lit * (0.25 + 0.75 * band));
  col = mix(col, uColPaper, lit * band * 0.45);
  col += uColAccent * pow(band, 3.0) * 0.30;

  // The damped hubs would read as holes — give them a core instead.
  float cores = exp(-length(p1) * 11.0) + exp(-length(p2) * 11.0);
  col += uColAccent * cores * 0.8;

  fragColor = vec4(col, 1.0);
}
