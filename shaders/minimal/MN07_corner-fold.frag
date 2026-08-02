// A paper-bright corner fold lifts and lets its diagonal shadow wander.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 corner = vec2(iResolution.x / iResolution.y, 1.0);
  vec2 p = corner - uv;
  float phase = iTime * 0.72 + uSeed * 1.773;
  float foldSize = 0.52 + sin(phase * 0.67) * 0.075;
  float creaseDistance = abs(p.x + p.y - foldSize);

  float inSquare = step(max(p.x, p.y), foldSize);
  float inTriangle = inSquare * step(p.x + p.y, foldSize);
  float crease = exp(-creaseDistance * 65.0) * inSquare;
  float shadowOffset = 0.065 + sin(phase * 1.25) * 0.032;
  float shadow = exp(-abs(p.x + p.y - foldSize - shadowOffset) * 18.0)
    * (1.0 - smoothstep(0.0, foldSize, max(p.x, p.y)));
  float shimmer = 0.72 + 0.28 * sin((p.x - p.y) * 9.0 + phase);
  float cornerHaze = exp(-length(p) * 2.7);

  vec3 col = mix(uColBg, uColDim, 0.1 + cornerHaze * 0.18);
  col = mix(col, uColInk, shadow * 0.58);
  col = mix(col, uColPaper, inTriangle * (0.72 + cornerHaze * 0.18));
  col += uColAccent * crease * shimmer * 0.75;
  col += uColSignal * cornerHaze * 0.12;

  fragColor = vec4(col, 1.0);
}
