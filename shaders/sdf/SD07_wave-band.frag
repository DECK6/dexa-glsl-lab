// Three horizontal bands whose centerline and half-width are both sine sums.
// Distance to a band is cheap; the distortion does all the work.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 col = uColBg;

  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float seed = fi * 1.37 + uSeed * 6.2831853;

    float y = (fi - 1.0) * 0.42
      + 0.15 * sin(uv.x * 2.1 + iTime * 0.85 + seed)
      + 0.06 * sin(uv.x * 5.3 - iTime * 1.4 + seed * 2.0);

    float w = 0.045 + 0.030 * sin(uv.x * 3.1 - iTime * 1.15 + seed);

    float d = abs(uv.y - y) - w;

    float core = smoothstep(0.007, -0.005, d);
    float glow = exp(-max(d, 0.0) * 13.0);
    vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(seed + iTime * 0.35));

    col += tint * glow * 0.75;
    col = mix(col, uColPaper, core * 0.9);

    // A bright packet rides each band from left to right.
    float head = exp(-pow((uv.x - sin(iTime * 0.4 + seed) * 1.3) * 2.6, 2.0));
    col += uColAccent * head * glow * 1.2;
  }

  col = mix(col, uColBg, smoothstep(1.0, 1.6, length(uv)) * 0.7);

  fragColor = vec4(col, 1.0);
}
