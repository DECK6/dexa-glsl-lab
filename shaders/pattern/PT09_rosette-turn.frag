// A rosette built in polar space: a nine-fold petal ring with a counter-turning
// inner ring at double the fold count, tied together by radial spokes.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float k = 9.0;
  float spin = iTime * 0.35 + uSeed * 6.2831853;

  // Outer petal ring.
  float outerR = 0.62 + 0.14 * cos(a * k + spin);
  float outer = exp(-pow((r - outerR) * 11.0, 2.0));

  // Inner ring turns the other way, twice as fast, twice as many folds.
  float innerR = 0.30 + 0.07 * cos(a * k * 2.0 - spin * 1.6);
  float inner = exp(-pow((r - innerR) * 17.0, 2.0));

  // Spokes only exist in the annulus between the two rings.
  float spokes = pow(abs(cos(a * k + spin)), 22.0)
               * smoothstep(0.30, 0.34, r) * smoothstep(0.80, 0.66, r);

  // A breathing ripple crosses the whole medallion.
  float ripple = 0.5 + 0.5 * sin(r * 18.0 - iTime * 1.8);

  vec3 col = mix(uColBg, uColInk, 0.22);
  col += uColSignal * outer * (0.75 + 0.55 * ripple);
  col += uColAccent * inner * (0.85 + 0.5 * ripple);
  col += uColAccent * spokes * 0.7;
  col = mix(col, uColPaper, pow(outer, 3.0) * 0.45);

  // Hub and a faint outer halo so the corners are not dead background.
  col = mix(col, uColPaper, smoothstep(0.12, 0.06, r) * (0.4 + 0.4 * ripple));
  col += uColDim * exp(-pow((r - 1.02) * 3.5, 2.0)) * 0.45;

  fragColor = vec4(col, 1.0);
}
