// A checkerboard floor in perspective. The plane rolls and the horizon drifts,
// so the squares shear and stretch on their way to the vanishing line.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float roll = 0.35 * sin(iTime * 0.31 + uSeed * 5.0);
  float cr = cos(roll);
  float sr = sin(roll);
  vec2 p = vec2(uv.x * cr - uv.y * sr, uv.x * sr + uv.y * cr);

  float horizon = 0.18 + 0.10 * sin(iTime * 0.23);
  float below = horizon - p.y;

  vec3 col = mix(uColBg, uColInk, 0.35);

  if (below > 0.0) {
    // Project: depth is the reciprocal of how far the pixel sits below the horizon.
    float depth = 1.0 / (below + 0.02);
    vec2 plane = vec2(p.x * depth * 0.9 + iTime * 0.35, depth * 0.55 - iTime * 0.9);

    vec2 cell = floor(plane);
    float parity = mod(cell.x + cell.y, 2.0);

    vec3 light = mix(uColSignal, uColPaper, 0.35);
    vec3 dark = mix(uColBg, uColAccent, 0.25);
    vec3 floorCol = mix(dark, light, parity);

    // Fade the checker to its own average as the cells shrink, killing the buzz.
    float fade = smoothstep(0.0, 0.35, below);
    floorCol = mix(mix(dark, light, 0.5), floorCol, fade);

    // Distance haze pulls the far tiles back toward the background.
    float haze = exp(-below * 4.0);
    col = mix(floorCol, mix(uColBg, uColDim, 0.5), haze * 0.85);
  } else {
    // Sky side: an accent glow banked against the horizon, ribbed with haze bands.
    float glow = exp(-(p.y - horizon) * 6.0);
    float bands = 0.5 + 0.5 * sin((p.y - horizon) * 30.0 - iTime * 1.2);
    col += uColAccent * glow * 0.45;
    col += uColDim * glow * bands * 0.4;
  }

  col += uColPaper * exp(-abs(p.y - horizon) * 140.0) * 0.7;

  fragColor = vec4(col, 1.0);
}
