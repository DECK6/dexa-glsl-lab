// A drafting compass constructs two intersecting circles, their radical axis,
// and a rotating measurement arm. Tick marks retain the geometry after it moves.

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.48 + uSeed * 0.3;
  vec2 centreA = vec2(-0.28 + sin(t) * 0.12, 0.0);
  vec2 centreB = vec2(0.31 + cos(t * 0.83) * 0.1, 0.0);
  float radiusA = 0.58 + 0.08 * sin(t * 1.31);
  float radiusB = 0.5 + 0.1 * cos(t * 1.07);
  float circleA = exp(-abs(length(uv - centreA) - radiusA) * 55.0);
  float circleB = exp(-abs(length(uv - centreB) - radiusB) * 55.0);
  vec2 armEnd = centreA + vec2(cos(t * 1.7), sin(t * 1.7)) * radiusA;
  float arm = exp(-segmentDistance(uv, centreA, armEnd) * 65.0);
  float axis = exp(-abs(uv.x - (centreA.x + centreB.x) * 0.5) * 72.0) * smoothstep(0.95, 0.15, abs(uv.y));

  float polar = atan(uv.y - centreA.y, uv.x - centreA.x) / 6.2831853 * 48.0;
  float ticks = step(0.83, fract(polar))
    * smoothstep(radiusA + 0.08, radiusA + 0.02, length(uv - centreA))
    * smoothstep(radiusA - 0.02, radiusA - 0.08, length(uv - centreA));

  vec3 col = mix(uColBg, uColInk, 0.4);
  col += uColSignal * circleA * 0.78;
  col += uColAccent * circleB * 0.82;
  col += uColDim * (axis * 0.55 + ticks * 0.65);
  col = mix(col, uColPaper, clamp(arm + circleA * circleB, 0.0, 1.0) * 0.72);
  col += uColAccent * exp(-length(uv - armEnd) * 24.0) * 0.55;

  fragColor = vec4(col, 1.0);
}
