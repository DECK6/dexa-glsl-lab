// Truchet arcs on a skew triangular lattice. Each rhomb chooses one of its
// three vertices, making quarter-rings lock into a changing triangular chain.

float hash21(vec2 p) {
  p = fract(p * vec2(163.31, 271.09) + uSeed * 0.33);
  p += dot(p, p + 29.77);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 skew = vec2(uv.x / 1.7320508 - uv.y / 3.0, uv.y * 0.6666667) * 5.2;
  vec2 tileId = floor(skew);
  vec2 bary = fract(skew);
  float upperTriangle = step(1.0, bary.x + bary.y);
  vec2 local = upperTriangle > 0.5 ? 1.0 - bary : bary;
  float rnd = hash21(tileId + upperTriangle * 17.0);

  vec2 vertex = rnd < 0.333 ? vec2(0.0, 0.0)
    : (rnd < 0.666 ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  float radius = length((local - vertex) * vec2(1.0, 0.92));
  float arcDistance = abs(radius - 0.52);
  float arc = smoothstep(0.065, 0.018, arcDistance);
  float glow = exp(-arcDistance * 13.0);
  float chainPhase = atan(local.y - vertex.y, local.x - vertex.x) * 7.0
    - iTime * 3.1 + rnd * 8.0;
  float bead = pow(0.5 + 0.5 * sin(chainPhase), 8.0);

  vec3 col = mix(uColBg, uColDim, 0.3 + glow * 0.18);
  col = mix(col, uColInk, arc * 0.7);
  col = mix(col, uColSignal, arc * (0.45 + bead * 0.4));
  col += uColAccent * arc * bead * 0.8;
  col = mix(col, uColPaper, arc * bead * 0.42);

  fragColor = vec4(col, 1.0);
}
