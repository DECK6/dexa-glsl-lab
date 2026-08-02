// Five drop points ring out on a stagger. Their crests add and cancel, so
// the lattice they draw never settles into the same shape twice.

vec2 dropAt(float i) {
  float a = fract(sin(i * 91.7 + uSeed * 13.1) * 43758.5453);
  float b = fract(sin(i * 47.3 + uSeed * 7.7) * 24634.6345);
  return (vec2(a, b) * 2.0 - 1.0) * 0.8;
}

float ripple(vec2 uv, vec2 c, float t) {
  float d = length(uv - c);
  float wave = sin(d * 24.0 - t * 3.6);
  // the ring only exists behind its own expanding front
  float front = exp(-max(d - t * 0.45, 0.0) * 13.0);
  return wave * front * exp(-d * 1.5);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float h = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float period = 4.4 + fi * 0.8;
    float t = mod(iTime + fi * 1.7, period);
    h += ripple(uv, dropAt(fi), t);
  }

  float crest = smoothstep(0.04, 0.42, h);
  float trough = smoothstep(0.04, 0.38, -h);

  vec3 col = mix(uColBg, uColInk, 0.3 + 0.45 * trough);
  col = mix(col, uColSignal, crest);
  col = mix(col, uColPaper, smoothstep(0.5, 0.85, h));
  col += uColAccent * pow(max(h, 0.0), 3.0) * 1.1;

  fragColor = vec4(col, 1.0);
}
