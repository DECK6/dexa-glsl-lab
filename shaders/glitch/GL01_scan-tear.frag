// A broadcast test card whose rows get yanked sideways by a tear head rolling
// up the frame. Row offsets are hashed, so the rip never repeats.

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

vec3 card(vec2 p) {
  float bars = step(0.55, fract(p.y * 4.0 + 0.2));
  float ring = smoothstep(0.04, 0.0, abs(length(p) - 0.52));
  float slab = step(abs(p.x), 0.14) * step(abs(p.y), 0.9);
  vec3 col = mix(uColBg, uColInk, 0.9);
  col = mix(col, uColSignal * 0.55, bars * 0.85);
  col = mix(col, uColAccent, slab * 0.8);
  col = mix(col, uColPaper, ring);
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float rows = 140.0;
  float row = floor(uv.y * rows);
  float clock = mod(floor(iTime * 18.0), 2048.0);

  float head = mix(-1.15, 1.15, fract(iTime * 0.26 + uSeed * 0.37));
  float near = exp(-abs(uv.y - head) * 8.0);

  float jitter = hash11(row * 1.7 + clock + uSeed * 53.0) - 0.5;
  float shift = jitter * near * 0.6 + near * 0.16 * sin(iTime * 3.1);

  vec3 col = card(vec2(uv.x + shift, uv.y));

  // badly torn rows bleed signal and the head itself burns a paper seam
  float torn = near * step(0.22, abs(jitter));
  col = mix(col, uColSignal, torn * 0.4);
  col += uColPaper * smoothstep(0.014, 0.0, abs(uv.y - head)) * 0.9;

  col *= 0.74 + 0.26 * step(0.5, fract(uv.y * rows * 0.5));
  fragColor = vec4(col, 1.0);
}
