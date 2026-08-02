// Light stays on the frame boundary while two soft charges circle its edge.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 bounds = vec2(iResolution.x / iResolution.y, 1.0);
  vec2 inset = bounds - abs(uv);
  float edgeDistance = min(inset.x, inset.y);
  float angle = atan(uv.y, uv.x);

  float phaseA = angle - iTime * 0.62 - uSeed * 1.913;
  float phaseB = angle + iTime * 0.39 + uSeed * 3.7;
  float chargeA = pow(0.5 + 0.5 * cos(phaseA), 12.0);
  float chargeB = pow(0.5 + 0.5 * cos(phaseB), 16.0);
  float broad = exp(-edgeDistance * 4.2);
  float glow = exp(-edgeDistance * 15.0);
  float rim = 1.0 - smoothstep(0.0, 0.035, edgeDistance);

  vec3 col = mix(uColBg, uColDim, 0.08 + broad * 0.2);
  col += uColSignal * glow * (0.24 + chargeA * 0.85);
  col += uColAccent * glow * chargeB * 0.75;
  col = mix(col, uColPaper, rim * (0.35 + chargeA * 0.65));

  fragColor = vec4(col, 1.0);
}
