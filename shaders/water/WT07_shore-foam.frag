// One wash cycle of a shoreline: the edge runs up the sand and drains back,
// dragging a broken lace of foam with it.

float hash21(vec2 p) {
  p = fract(p * vec2(127.11, 311.7) + uSeed);
  p += dot(p, p + 27.31);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p = p * 2.03 + 7.1;
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float wash = pow(0.5 + 0.5 * sin(iTime * 0.5), 0.7);
  float edge = mix(-0.5, 0.35, wash) + 0.09 * fbm(vec2(uv.x * 1.8, iTime * 0.25));

  float sea = smoothstep(edge - 0.015, edge + 0.05, uv.y);

  float lace = fbm(vec2(uv.x * 7.0, (uv.y - edge) * 11.0 - iTime * 0.8));
  float foam = smoothstep(0.42, 0.72, lace) * exp(-abs(uv.y - edge) * 7.0);
  foam += smoothstep(0.022, 0.0, abs(uv.y - edge)) * 0.85;

  float grain = fbm(uv * 16.0);
  float wet = exp(-max(edge - uv.y, 0.0) * 3.4);

  vec3 sand = mix(uColBg, uColDim, 0.4 + 0.35 * grain);
  sand = mix(sand, uColInk, wet * 0.45);

  float shimmer = 0.5 + 0.5 * sin(uv.y * 13.0 - iTime * 2.2 + fbm(uv * 2.5) * 4.0);
  vec3 water = mix(uColBg, uColInk, 0.5);
  water = mix(water, uColSignal, 0.22 + 0.35 * shimmer);

  vec3 col = mix(sand, water, sea);
  col = mix(col, uColPaper, clamp(foam, 0.0, 1.0));
  col += uColAccent * smoothstep(0.95, 1.4, foam) * 0.5;

  fragColor = vec4(col, 1.0);
}
