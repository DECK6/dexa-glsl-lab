// Three triangular panels share a hinge and unfold into an isometric mark.
// Their projected vertices slide while separate face values preserve the fold.

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

vec2 triangleData(vec2 p, vec2 a, vec2 b, vec2 c) {
  float orientation = sign(cross2(b - a, c - a));
  float inside = step(0.0, cross2(b - a, p - a) * orientation)
    * step(0.0, cross2(c - b, p - b) * orientation)
    * step(0.0, cross2(a - c, p - c) * orientation);
  float edge = min(segmentDistance(p, a, b), min(segmentDistance(p, b, c), segmentDistance(p, c, a)));
  return vec2(inside, edge);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float fold = 0.5 + 0.5 * sin(iTime * 0.72 + uSeed);
  vec2 centre = vec2(0.0, -0.08);
  vec2 top = vec2(0.0, 0.82 + fold * 0.12);
  vec2 left = vec2(-0.82 + fold * 0.24, -0.48);
  vec2 right = vec2(0.82 - fold * 0.12, -0.48);
  vec2 inner = vec2((fold - 0.5) * 0.26, 0.08 + fold * 0.2);

  vec2 faceA = triangleData(uv, centre, top, inner);
  vec2 faceB = triangleData(uv, centre, inner, left);
  vec2 faceC = triangleData(uv, centre, right, inner);
  float seam = exp(-min(faceA.y, min(faceB.y, faceC.y)) * 48.0);

  vec3 col = mix(uColBg, uColInk, 0.43);
  col = mix(col, uColSignal * (0.45 + fold * 0.35), faceA.x * 0.9);
  col = mix(col, uColAccent * (0.4 + (1.0 - fold) * 0.4), faceB.x * 0.9);
  col = mix(col, uColDim, faceC.x * 0.85);
  col += uColPaper * seam * (0.25 + fold * 0.5);
  col += uColSignal * exp(-length(uv - inner) * 18.0) * 0.35;

  fragColor = vec4(col, 1.0);
}
