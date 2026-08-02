// Two sustained sources, slowly orbiting each other. Their sum draws the
// hyperbolic nodal lines that only interference can make.

float source(vec2 uv, vec2 c, float t) {
  float d = length(uv - c);
  return sin(d * 30.0 - t * 6.0) / (1.0 + d * 2.4);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float spin = iTime * 0.18 + uSeed;
  float sep = 0.42 + 0.1 * sin(iTime * 0.33);
  vec2 a = vec2(cos(spin), sin(spin) * 0.55) * sep;
  vec2 b = -a;

  float h = source(uv, a, iTime) + source(uv, b, iTime);
  float energy = abs(h);

  vec3 col = mix(uColBg, uColInk, smoothstep(0.0, 0.3, energy));
  col = mix(col, uColSignal, smoothstep(0.28, 0.62, energy));
  col = mix(col, uColPaper, smoothstep(0.62, 0.95, h));

  // the dead lines between the fringes are the actual subject
  float node = smoothstep(0.09, 0.0, energy);
  col = mix(col, uColBg * 0.55, node * 0.85);

  float glow = exp(-length(uv - a) * 12.0) + exp(-length(uv - b) * 12.0);
  col += uColAccent * glow * 0.8;

  fragColor = vec4(col, 1.0);
}
