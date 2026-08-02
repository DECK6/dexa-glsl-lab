// A triangular prism rolls in perspective while a scan plane travels through
// its depth. Edge intersections flare where the plane cuts the wire solid.

float lineDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

mat3 spinZ(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
}

mat3 spinY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

vec2 viewPoint(vec3 p) {
  return p.xy * 1.7 / (p.z + 3.4);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.55 + uSeed * 0.2;
  mat3 spin = spinY(t) * spinZ(t * 0.73);
  vec3 a = spin * vec3(0.0, 0.78, -0.62);
  vec3 b = spin * vec3(-0.68, -0.42, -0.62);
  vec3 c = spin * vec3(0.68, -0.42, -0.62);
  vec3 d = spin * vec3(0.0, 0.78, 0.62);
  vec3 e = spin * vec3(-0.68, -0.42, 0.62);
  vec3 f = spin * vec3(0.68, -0.42, 0.62);
  vec2 pa = viewPoint(a), pb = viewPoint(b), pc = viewPoint(c);
  vec2 pd = viewPoint(d), pe = viewPoint(e), pf = viewPoint(f);
  float edge = lineDistance(uv, pa, pb);
  edge = min(edge, min(lineDistance(uv, pb, pc), lineDistance(uv, pc, pa)));
  edge = min(edge, min(lineDistance(uv, pd, pe), lineDistance(uv, pe, pf)));
  edge = min(edge, min(lineDistance(uv, pf, pd), lineDistance(uv, pa, pd)));
  edge = min(edge, min(lineDistance(uv, pb, pe), lineDistance(uv, pc, pf)));

  float wire = exp(-edge * 70.0);
  float scanY = mix(-0.9, 0.9, fract(iTime * 0.22 + uSeed * 0.1));
  float scan = exp(-abs(uv.y - scanY) * 34.0) * smoothstep(0.85, 0.0, abs(uv.x));
  float cut = wire * scan;

  vec3 col = mix(uColBg, uColInk, 0.43 + scan * 0.16);
  col += uColSignal * wire * 0.9;
  col += uColAccent * scan * 0.48;
  col = mix(col, uColPaper, clamp(cut * 2.2, 0.0, 1.0));
  col += uColDim * exp(-edge * 18.0) * 0.24;

  fragColor = vec4(col, 1.0);
}
