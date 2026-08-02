// Two warped stripe veils hung over each other. Each veil is a stripe field
// bent by a slow sine; where the bends disagree the overlap ripples like two
// layers of gauze pulled in opposite directions.

vec2 rot(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c) * p;
}

float veilPhase(vec2 p, float k, float bend, float freq, float phase) {
  return (p.y + bend * sin(p.x * freq + phase)) * k;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float sway = 0.075 + 0.05 * sin(iTime * 0.21 + uSeed);
  float pa = veilPhase(uv, 124.0, 0.26, 2.1, iTime * 0.55);
  float pb = veilPhase(rot(uv, sway), 129.0, 0.21, 2.9, -iTime * 0.43 + uSeed);

  float weave = sin(pa) * sin(pb);
  float beat = cos(pa - pb);
  float silk = smoothstep(-0.35, 0.9, weave);
  float band = smoothstep(-0.4, 0.95, beat);

  vec3 col = mix(uColBg, uColDim, 0.16 + 0.34 * band);
  col = mix(col, uColSignal, silk * (0.25 + 0.6 * band));
  col = mix(col, uColPaper, pow(silk, 3.0) * band * 0.7);
  col += uColAccent * pow(1.0 - band, 4.0) * 0.35;

  fragColor = vec4(col, 1.0);
}
