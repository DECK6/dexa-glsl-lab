// Twist vortex: the angular coordinate is sheared by an exponential falloff in
// radius, so a field of diagonal stripes winds into a spiral that unwinds and
// rewinds without ever settling.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float r = length(uv) + 1e-4;
  float a = atan(uv.y, uv.x);

  float amount = 3.4 + 2.8 * sin(iTime * 0.33 + uSeed);
  a += amount * exp(-r * 1.5) + iTime * 0.4;

  vec2 w = vec2(cos(a), sin(a)) * r;

  float d1 = abs(fract((w.x + w.y) * 2.6) - 0.5);
  float d2 = abs(fract((w.x - w.y) * 5.2 + 0.25) - 0.5);
  float stripes = smoothstep(0.32, 0.5, d1);
  float weave = smoothstep(0.42, 0.5, d2);

  // twist rate reads as speed: the tighter the winding, the hotter the ink
  float shear = abs(amount) * exp(-r * 1.5) * 0.22;
  float core = exp(-r * 3.2);

  vec3 col = mix(uColBg, uColInk, 0.4 + 0.6 * weave);
  col = mix(col, uColDim * 0.8, weave * 0.45);
  col = mix(col, uColSignal, stripes * (0.35 + 0.65 * smoothstep(1.4, 0.1, r)));
  col = mix(col, uColAccent, stripes * smoothstep(0.35, 0.95, shear));
  col = mix(col, uColPaper, core * (0.35 + 0.65 * stripes));

  fragColor = vec4(col, 1.0);
}
