// A four-bar kinematic arm solves its joints from chained angles. Capsules show
// rigid links, circular bearings show pivots, and the end effector leaves a halo.

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.72 + uSeed;
  vec2 p0 = vec2(-0.72, -0.58);
  float a0 = 0.72 + sin(t) * 0.52;
  float a1 = a0 - 0.5 + cos(t * 1.31) * 0.78;
  float a2 = a1 + 0.42 + sin(t * 0.83 + 1.0) * 0.9;
  float a3 = a2 - 0.3 + cos(t * 1.57 + 0.4) * 0.8;
  vec2 p1 = p0 + vec2(cos(a0), sin(a0)) * 0.55;
  vec2 p2 = p1 + vec2(cos(a1), sin(a1)) * 0.48;
  vec2 p3 = p2 + vec2(cos(a2), sin(a2)) * 0.42;
  vec2 p4 = p3 + vec2(cos(a3), sin(a3)) * 0.31;

  float linkA = min(segmentDistance(uv, p0, p1), segmentDistance(uv, p2, p3));
  float linkB = min(segmentDistance(uv, p1, p2), segmentDistance(uv, p3, p4));
  float bearing = min(length(uv - p0), length(uv - p1));
  bearing = min(bearing, min(length(uv - p2), min(length(uv - p3), length(uv - p4))));
  float barsA = smoothstep(0.075, 0.042, linkA);
  float barsB = smoothstep(0.075, 0.042, linkB);
  float joints = smoothstep(0.11, 0.055, bearing);
  float holes = smoothstep(0.035, 0.018, bearing);

  vec3 col = mix(uColBg, uColInk, 0.42);
  col = mix(col, uColSignal, barsA * 0.82);
  col = mix(col, uColAccent, barsB * 0.82);
  col = mix(col, uColPaper, joints * 0.88);
  col = mix(col, uColBg, holes * 0.85);
  col += uColSignal * exp(-length(uv - p4) * 10.0) * 0.45;
  col += uColDim * exp(-min(linkA, linkB) * 15.0) * 0.18;

  fragColor = vec4(col, 1.0);
}
