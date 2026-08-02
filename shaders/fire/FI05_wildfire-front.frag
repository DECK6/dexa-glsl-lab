// A wildfire front crosses a dark hillside. Layered one-dimensional noise
// shapes the advancing edge while short flames peel off in the wind.

float hash11(float p) {
  return fract(sin(p * 127.17 + uSeed * 17.3) * 43758.5453);
}

float noise11(float p) {
  float i = floor(p);
  float f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), f);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float travel = -1.7 + mod(iTime * 0.34 + uSeed * 0.1, 3.4);
  float terrain = -0.58 + 0.12 * sin(uv.x * 2.1) + 0.08 * sin(uv.x * 5.7 + 1.2);
  float jagged = noise11(uv.y * 5.1 - iTime * 1.2) * 0.48
    + noise11(uv.y * 13.0 + iTime * 0.8) * 0.16;
  float edge = travel + jagged - (uv.y - terrain) * 0.36;
  float burned = smoothstep(edge + 0.16, edge - 0.5, uv.x);
  float front = exp(-abs(uv.x - edge) * 8.0) * smoothstep(terrain - 0.08, terrain + 0.55, uv.y);

  float bladePhase = uv.x * 7.0 + uv.y * 16.0 - iTime * 7.5;
  float blades = smoothstep(0.2, 0.95, 0.5 + 0.5 * sin(bladePhase));
  blades *= exp(-abs(uv.x - edge) * 17.0) * smoothstep(terrain - 0.02, terrain + 0.48, uv.y);
  float ground = smoothstep(terrain + 0.035, terrain - 0.035, uv.y);

  vec3 col = mix(uColBg, uColDim, smoothstep(-1.0, 1.0, uv.y) * 0.18);
  col = mix(col, uColInk, ground * (0.65 + burned * 0.35));
  col += uColAccent * front * (0.55 + blades * 1.3);
  col = mix(col, mix(uColAccent, uColPaper, 0.58), blades);
  col += uColPaper * exp(-abs(uv.x - edge) * 32.0) * ground * 0.5;
  col += uColSignal * (1.0 - burned) * ground * 0.08;

  fragColor = vec4(col, 1.0);
}
