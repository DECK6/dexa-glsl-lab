// A stage spotlight pivots from a high rig, sweeping a broad cone across
// floor haze while its hot pool stretches beneath the moving beam.

mat2 spotRot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float swing = 0.46 * sin(iTime * 0.62 + uSeed * 4.7 + 0.8);
  vec2 q = spotRot(-swing) * (uv - vec2(0.0, 1.04));
  float depth = max(-q.y, 0.0);
  float edge = abs(q.x) - depth * 0.43;

  float cone = smoothstep(0.10, -0.12, edge) * smoothstep(0.0, 0.18, depth);
  cone *= exp(-depth * 0.40);
  float ribs = 0.72 + 0.28 * pow(0.5 + 0.5 * cos(q.x * 42.0 + iTime), 6.0);

  vec2 floorPoint = vec2(sin(swing) * 1.18, -0.82);
  vec2 floorUv = uv - floorPoint;
  float pool = exp(-(floorUv.x * floorUv.x * 2.0 + floorUv.y * floorUv.y * 52.0));
  float rig = smoothstep(0.055, 0.025, length(uv - vec2(0.0, 0.96)));
  float mist = 0.5 + 0.5 * sin(uv.y * 18.0 + uv.x * 7.0 - iTime * 0.8 + uSeed);

  vec3 col = mix(uColBg, uColInk, 0.48);
  col += uColSignal * cone * ribs * (0.34 + mist * 0.14);
  col += uColAccent * pool * 1.15;
  col += uColPaper * (cone * smoothstep(-0.04, 0.07, edge) * 0.24 + rig);
  fragColor = vec4(col, 1.0);
}
