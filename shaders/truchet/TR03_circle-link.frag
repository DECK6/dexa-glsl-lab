// Arc Truchet drawn as rope: each quarter gets a dark rim and a bright core,
// and a ring of light walks outward through the linked loops forever.

float hash21(vec2 p) {
  p = fract(p * vec2(163.3, 271.9) + uSeed * 0.421);
  p += dot(p, p + 33.1);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = rot(iTime * 0.06) * uv * 2.4;

  vec2 id = floor(p);
  vec2 g = fract(p);
  if (hash21(id) > 0.5) g.x = 1.0 - g.x;

  float dA = length(g - vec2(0.0, 1.0));
  float dB = length(g - vec2(1.0, 0.0));
  float d = abs(min(dA, dB) - 0.5);

  float rope = smoothstep(0.13, 0.10, d);
  float rim = rope - smoothstep(0.075, 0.05, d);
  float core = smoothstep(0.06, 0.02, d);

  // a ring of light expands through the chain, never settling
  float wave = 0.5 + 0.5 * sin(length(uv) * 4.0 - iTime * 1.6);
  wave = pow(wave, 3.0);

  vec3 col = mix(uColBg, uColDim, 0.28);
  col = mix(col, uColInk, rope);
  col = mix(col, uColSignal, rim * (0.5 + 0.5 * wave));
  col = mix(col, uColPaper, core * (0.35 + 0.55 * wave));
  col += uColAccent * core * wave * 1.2;
  col += uColSignal * exp(-d * 7.0) * 0.2;

  fragColor = vec4(col, 1.0);
}
