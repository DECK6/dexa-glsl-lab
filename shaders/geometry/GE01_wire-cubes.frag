// Two wire cubes rotate on different axes and depths. Perspective projection
// makes their twelve edges breathe while a cyan orbit ties the pair together.

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

mat3 rotateX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

mat3 rotateY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

vec2 projectPoint(vec3 p) {
  return p.xy * 1.55 / (p.z + 3.2);
}

float cubeDistance(vec2 p, mat3 spin, vec3 centre, float size) {
  vec3 a = spin * (vec3(-1.0, -1.0, -1.0) * size) + centre;
  vec3 b = spin * (vec3( 1.0, -1.0, -1.0) * size) + centre;
  vec3 c = spin * (vec3( 1.0,  1.0, -1.0) * size) + centre;
  vec3 d = spin * (vec3(-1.0,  1.0, -1.0) * size) + centre;
  vec3 e = spin * (vec3(-1.0, -1.0,  1.0) * size) + centre;
  vec3 f = spin * (vec3( 1.0, -1.0,  1.0) * size) + centre;
  vec3 g = spin * (vec3( 1.0,  1.0,  1.0) * size) + centre;
  vec3 h = spin * (vec3(-1.0,  1.0,  1.0) * size) + centre;
  vec2 pa = projectPoint(a), pb = projectPoint(b), pc = projectPoint(c), pd = projectPoint(d);
  vec2 pe = projectPoint(e), pf = projectPoint(f), pg = projectPoint(g), ph = projectPoint(h);
  float lineDistance = segmentDistance(p, pa, pb);
  lineDistance = min(lineDistance, segmentDistance(p, pb, pc));
  lineDistance = min(lineDistance, segmentDistance(p, pc, pd));
  lineDistance = min(lineDistance, segmentDistance(p, pd, pa));
  lineDistance = min(lineDistance, segmentDistance(p, pe, pf));
  lineDistance = min(lineDistance, segmentDistance(p, pf, pg));
  lineDistance = min(lineDistance, segmentDistance(p, pg, ph));
  lineDistance = min(lineDistance, segmentDistance(p, ph, pe));
  lineDistance = min(lineDistance, segmentDistance(p, pa, pe));
  lineDistance = min(lineDistance, segmentDistance(p, pb, pf));
  lineDistance = min(lineDistance, segmentDistance(p, pc, pg));
  return min(lineDistance, segmentDistance(p, pd, ph));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.62 + uSeed * 0.2;
  float first = cubeDistance(uv, rotateY(t) * rotateX(t * 0.71), vec3(-0.48, 0.08, 0.15), 0.72);
  float second = cubeDistance(uv, rotateX(-t * 0.83) * rotateY(t * 1.17), vec3(0.62, -0.12, 0.72), 0.56);
  float wireA = exp(-first * 62.0);
  float wireB = exp(-second * 72.0);
  float orbit = exp(-abs(length(uv - vec2(0.05, 0.0)) - 0.78) * 36.0);

  vec3 col = mix(uColBg, uColInk, 0.42 + orbit * 0.2);
  col += uColSignal * wireA * 0.95;
  col += uColAccent * wireB * 1.05;
  col = mix(col, uColPaper, clamp(wireA * wireB * 1.8, 0.0, 1.0));
  col += uColDim * orbit * 0.48;

  fragColor = vec4(col, 1.0);
}
