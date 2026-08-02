// Nine moving construction nodes form a proximity graph. Edges exist only
// inside a distance budget, so the constellation rewires as its orbits cross.

float hash11(float p) {
  return fract(sin(p * 117.13 + uSeed * 23.7) * 43758.5453);
}

vec2 nodePosition(float index, float t) {
  float phase = hash11(index + 3.0) * 6.2831853;
  float radius = 0.28 + hash11(index + 17.0) * 0.58;
  float speed = 0.22 + hash11(index + 29.0) * 0.36;
  return vec2(cos(t * speed + phase), sin(t * speed * 1.17 + phase * 1.31)) * radius;
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + uSeed * 0.2;
  float network = 0.0;
  float nodes = 0.0;
  float hotNodes = 0.0;

  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec2 a = nodePosition(fi, t);
    float pointDistance = length(uv - a);
    nodes += exp(-pointDistance * pointDistance * 150.0);
    hotNodes += exp(-pointDistance * pointDistance * 500.0) * (0.5 + 0.5 * sin(t * 2.0 + fi));
    for (int j = 0; j < 9; j++) {
      if (j <= i) continue;
      vec2 b = nodePosition(float(j), t);
      float span = length(a - b);
      float admitted = smoothstep(0.86, 0.5, span);
      network += exp(-segmentDistance(uv, a, b) * 58.0) * admitted;
    }
  }

  vec3 col = mix(uColBg, uColInk, 0.42 + smoothstep(0.0, 1.4, network) * 0.25);
  col += uColSignal * clamp(network, 0.0, 1.6) * 0.42;
  col += uColAccent * clamp(nodes, 0.0, 1.0) * 0.9;
  col = mix(col, uColPaper, clamp(hotNodes, 0.0, 1.0));
  col += uColDim * smoothstep(1.4, 3.2, network) * 0.28;

  fragColor = vec4(col, 1.0);
}
