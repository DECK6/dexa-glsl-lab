// A distant straight horizon flickers above a softly illuminated lower field.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float phase = iTime * 0.31 + uSeed * 1.619;
  float horizon = -0.2 + sin(phase) * 0.038;
  float distanceToHorizon = abs(uv.y - horizon);
  float blink = 0.62 + pow(0.5 + 0.5 * sin(iTime * 1.17 + uSeed * 4.2), 5.0) * 0.38;
  float segments = 0.68 + 0.32
    * smoothstep(0.18, 0.82, 0.5 + 0.5 * sin(uv.x * 17.0 + uSeed * 5.0));

  float line = exp(-distanceToHorizon * 105.0) * blink * segments;
  float atmosphere = exp(-distanceToHorizon * 5.5);
  float lowerField = 1.0 - smoothstep(horizon - 0.62, horizon + 0.04, uv.y);
  float sunX = sin(uSeed * 8.1) * 0.34;
  float sunDistance = length(uv - vec2(sunX, horizon));
  float halfSun = (1.0 - smoothstep(0.22, 0.25, sunDistance))
    * smoothstep(horizon - 0.02, horizon + 0.045, uv.y);
  float sunHalo = exp(-sunDistance * 5.2) * 0.22;

  vec3 col = mix(uColBg, uColDim, 0.11 + lowerField * 0.24);
  col = mix(col, uColSignal, atmosphere * 0.2 + sunHalo);
  col = mix(col, uColAccent, halfSun * 0.5);
  col += uColPaper * line * 0.82;

  fragColor = vec4(col, 1.0);
}
