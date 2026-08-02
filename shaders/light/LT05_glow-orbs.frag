// Six luminous bodies follow mismatched elliptical orbits and cross paths.
// Their soft fields accumulate into bright knots without erasing each core.

float orbField(vec2 p, float radius) {
  float d = length(p);
  return radius * radius / (d * d + radius * radius * 0.18);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float cyanGlow = 0.0;
  float orangeGlow = 0.0;
  float cores = 0.0;
  float paths = 0.0;

  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float phase = iTime * (0.28 + fi * 0.045) + fi * 1.83 + uSeed * (1.2 + fi * 0.13);
    vec2 centre = vec2(
      sin(phase) * (0.34 + fi * 0.085),
      cos(phase * (1.13 + fi * 0.025)) * (0.72 - fi * 0.055)
    );
    centre = mat2(cos(fi * 0.51), -sin(fi * 0.51), sin(fi * 0.51), cos(fi * 0.51)) * centre;
    float radius = 0.045 + 0.009 * mod(fi, 3.0);
    float field = orbField(uv - centre, radius);
    float core = smoothstep(radius, radius * 0.25, length(uv - centre));
    cyanGlow += field * (1.0 - mod(fi, 2.0));
    orangeGlow += field * mod(fi, 2.0);
    cores += core;
    float ellipse = abs(length(uv / vec2(0.72 + fi * 0.03, 0.42 + fi * 0.04)) - 1.0);
    paths += exp(-ellipse * 95.0) * 0.08;
  }

  vec3 col = mix(uColBg, uColInk, 0.36);
  col += uColSignal * (cyanGlow * 0.48 + paths);
  col += uColAccent * (orangeGlow * 0.43 + paths * 0.45);
  col += uColPaper * min(cores, 1.0) * 0.92;
  fragColor = vec4(col, 1.0);
}
