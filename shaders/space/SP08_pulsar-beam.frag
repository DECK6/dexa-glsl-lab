// Opposed rotating cones sweep outward from a compact pulsing stellar core.
// Magnetic rings tighten around the source as near-facing passes flash the frame.

float sp08Hash(vec2 p) {
  p = fract(p * vec2(157.49, 443.27) + uSeed * 0.571);
  p += dot(p, p + 36.83);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float direction = t * 0.32 + uSeed * 0.71;
  float delta = angle - direction;

  float beamCore = pow(abs(cos(delta)), 30.0);
  float beamBody = pow(abs(cos(delta)), 9.0);
  float radialFade = exp(-r * 1.25) * smoothstep(0.055, 0.18, r);
  float beam = (beamBody * 0.34 + beamCore * 0.88) * radialFade;
  float beamEdge = exp(-abs(abs(sin(delta)) - 0.285) * 32.0) * radialFade;
  float pulse = pow(0.5 + 0.5 * sin(t * 0.45), 8.0);

  float ringWave = pow(max(cos(r * 47.0 - t * 1.15
                               + sin(angle * 2.0) * 0.7), 0.0), 15.0);
  float magneticRings = ringWave * exp(-r * 3.4) * smoothstep(0.08, 0.22, r);
  float coreGlow = exp(-r * 22.0);
  float core = exp(-r * 78.0);

  vec2 starGrid = (uv + uSeed * 0.023) * 87.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float stars = smoothstep(0.981, 0.999, sp08Hash(starCell))
                * exp(-dot(starLocal, starLocal) * 210.0);
  float mist = 0.5 + 0.5 * sin(angle * 5.0 - r * 7.0 + t * 0.17);

  vec3 col = mix(uColBg, uColInk, 0.31 + mist * 0.11);
  col += uColPaper * stars * 0.56;
  col += uColSignal * beam * (0.72 + pulse * 1.15);
  col += uColAccent * beamEdge * (0.32 + pulse * 0.78);
  col += uColSignal * magneticRings * 0.82;
  col += uColAccent * magneticRings * pulse * 0.46;
  col += uColSignal * coreGlow * 1.25;
  col = mix(col, uColPaper * 1.48, clamp(core * (1.0 + pulse), 0.0, 1.0));
  col += uColPaper * pulse * (0.035 + beamCore * 0.08);
  fragColor = vec4(col, 1.0);
}
