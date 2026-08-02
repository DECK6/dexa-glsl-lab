// Brightness-thresholded pixel sort: each row walks left while the source stays
// lit, then drags that far sample back, stretching bright pixels into runs.

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

float lum(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 src(vec2 p) {
  vec2 c = 0.35 * vec2(cos(iTime * 0.5), sin(iTime * 0.4));
  float blob = smoothstep(0.55, 0.10, length(p - c));
  float wedge = smoothstep(0.02, 0.0, abs(fract((atan(p.y, p.x) + iTime * 0.2) * 1.4) - 0.5) - 0.22);
  vec3 col = mix(uColBg, uColInk, 0.9);
  col = mix(col, uColSignal, blob * 0.9);
  col = mix(col, uColAccent, wedge * blob * 1.1);
  col = mix(col, uColPaper, smoothstep(0.13, 0.10, length(p + 0.3)));
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float row = floor(uv.y * 200.0);
  float thr = 0.20 + 0.16 * sin(iTime * 0.7 + row * 0.04 + uSeed);

  vec3 here = src(uv);
  vec3 pick = here;
  float run = 0.0;
  for (int i = 1; i < 26; i++) {
    vec3 c = src(vec2(uv.x - float(i) * 0.011, uv.y));
    if (lum(c) < thr) break;
    pick = c;
    run = float(i);
  }

  float sorted = step(thr, lum(here)) * step(1.0, run);
  vec3 col = mix(here, pick, sorted * 0.92);

  // long runs blow out at the head and fall off along the tail
  col += uColPaper * step(24.0, run) * 0.35;
  col *= 1.0 - 0.25 * (run / 26.0);
  col += uColDim * 0.14 * hash11(row + floor(iTime * 3.0) + uSeed);

  fragColor = vec4(col, 1.0);
}
