// One particle per grid cell, each with its own drift and blink phase. Summing
// the 3x3 neighbourhood lets adjacent blooms overlap, so the cell grid never
// shows through. A per-pixel hash lays fine static over the whole frame.

vec2 hash22(vec2 p) {
  vec3 a = fract(p.xyx * vec3(127.1, 311.7, 74.7) + uSeed * 0.41);
  a += dot(a, a.yzx + 41.23);
  return fract(vec2(a.x * a.y, a.y * a.z));
}

float hash21(vec2 p) {
  p = fract(p * vec2(443.897, 397.297));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 g = uv * 6.5;
  vec2 cell = floor(g);
  vec2 f = fract(g);

  float bloom = 0.0;
  float core = 0.0;
  float hot = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(cell + o);
      vec2 pos = o + 0.5 + (h - 0.5) * 0.7
               + 0.1 * vec2(sin(iTime * 0.7 + h.x * 6.28), cos(iTime * 0.6 + h.y * 6.28));
      float ph = fract(iTime * (0.25 + h.x * 0.55) + h.y * 3.0);
      float blink = 0.2 + 0.8 * pow(sin(ph * 3.14159), 3.0);
      float d = length(f - pos);
      bloom += exp(-d * 4.5) * blink;
      core += smoothstep(0.055, 0.0, d) * blink;
      hot += exp(-d * 11.0) * blink * step(0.82, h.y);
    }
  }

  float grain = hash21(fragCoord + vec2(fract(iTime * 9.0) * 137.0, fract(iTime * 7.0) * 71.0));

  vec3 col = mix(uColBg, uColInk, 0.3 + 0.5 * grain);
  col += uColSignal * bloom * 0.8;
  col += uColAccent * hot * 1.3;
  col = mix(col, uColPaper, clamp(core, 0.0, 1.0));
  fragColor = vec4(col, 1.0);
}
