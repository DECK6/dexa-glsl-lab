// Space itself ripples: three drifting emitters push a dot lattice radially in
// and out, their wavefronts crossing into interference where they overlap.

vec2 ripple(vec2 p, vec2 c, float freq, float speed, float amp) {
  vec2 d = p - c;
  float r = length(d) + 1e-4;
  float wave = sin(r * freq - iTime * speed);
  return d / r * wave * amp * exp(-r * 0.8);
}

float lattice(vec2 p, float radius) {
  vec2 f = fract(p) - 0.5;
  return smoothstep(radius, radius * 0.3, length(f));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float t = iTime * 0.4 + uSeed;
  vec2 e1 = vec2(cos(t) * 0.8, sin(t * 0.7) * 0.6);
  vec2 e2 = vec2(sin(t * 1.1 + 1.7) * 0.7, cos(t * 0.9) * 0.75);
  vec2 e3 = vec2(cos(t * 0.5 + 3.0) * 0.35, sin(t * 0.6 + 2.0) * 0.35);

  vec2 w = uv;
  w += ripple(uv, e1, 16.0, 3.0, 0.055);
  w += ripple(uv, e2, 11.0, -2.2, 0.07);
  w += ripple(uv, e3, 22.0, 4.1, 0.035);

  float coarse = lattice(w * 7.0, 0.3);
  float fine = lattice(w * 21.0 + 0.5, 0.34);

  // wavefront energy — how far this texel got displaced
  float energy = length(w - uv) * 9.0;

  vec3 col = mix(uColBg, uColInk, 0.55);
  col = mix(col, uColDim * 0.7, fine * 0.55);
  col = mix(col, uColSignal, coarse * (0.4 + 0.6 * energy));
  col = mix(col, uColPaper, coarse * smoothstep(0.6, 1.2, energy));
  col += uColAccent * energy * 0.4 * fine;

  fragColor = vec4(col, 1.0);
}
