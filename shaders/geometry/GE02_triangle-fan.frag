// Radial triangles open like an iris. Each wedge owns a delayed height value,
// so the fan becomes a stepped turbine rather than a flat polar pattern.

float hash11(float p) {
  return fract(sin(p * 127.17 + uSeed * 19.1) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle01 = fract((atan(uv.y, uv.x) + 3.1415927) / 6.2831853);
  float wedgeCoord = angle01 * 24.0;
  float wedgeId = floor(wedgeCoord);
  float localAngle = abs(fract(wedgeCoord) - 0.5);
  float rnd = hash11(wedgeId);
  float lift = 0.5 + 0.5 * sin(iTime * 1.4 - wedgeId * 0.31 + rnd * 2.0);
  float outer = 0.34 + lift * 0.62;
  float triangle = smoothstep(outer, outer - 0.035, radius)
    * smoothstep(0.46, 0.18 + lift * 0.08, localAngle)
    * smoothstep(0.1, 0.18, radius);
  float spoke = exp(-localAngle * 28.0) * smoothstep(1.0, 0.12, radius);
  float rim = exp(-abs(radius - outer) * 44.0) * smoothstep(0.5, 0.25, localAngle);
  float hub = exp(-radius * radius * 48.0);

  vec3 blade = mix(uColSignal, uColAccent, lift);
  vec3 col = mix(uColBg, uColInk, 0.38 + spoke * 0.3);
  col = mix(col, blade * (0.35 + lift * 0.55), triangle);
  col += uColPaper * rim * (0.2 + lift * 0.65);
  col += uColSignal * hub * 0.8;
  col += uColDim * spoke * (1.0 - triangle) * 0.3;

  fragColor = vec4(col, 1.0);
}
