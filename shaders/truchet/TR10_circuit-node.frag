// Circuit-board Truchet: hashed tiles choose straight traces, elbows, or pads.
// A global diagonal clock makes packets turn corners without moving the board.

float hash21(vec2 p) {
  p = fract(p * vec2(311.7, 127.1) + uSeed * 0.39);
  p += dot(p, p + 39.3);
  return fract(p.x * p.y);
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.8;
  vec2 tileId = floor(p);
  vec2 local = fract(p) - 0.5;
  float rnd = hash21(tileId);
  float kind = floor(rnd * 3.0);

  float traceDistance;
  if (kind < 0.5) {
    traceDistance = abs(local.y);
  } else if (kind < 1.5) {
    traceDistance = abs(local.x);
  } else {
    float horizontal = segmentDistance(local, vec2(-0.5, 0.0), vec2(0.0, 0.0));
    float vertical = segmentDistance(local, vec2(0.0, 0.0), vec2(0.0, 0.5));
    traceDistance = min(horizontal, vertical);
    if (fract(rnd * 11.0) > 0.5) local *= -1.0;
  }
  float trace = smoothstep(0.07, 0.025, traceDistance);
  float pad = smoothstep(0.12, 0.06, length(local));
  float pulsePhase = dot(tileId, vec2(0.7, 1.1)) + iTime * 2.8 + rnd * 4.0;
  float pulse = pow(0.5 + 0.5 * sin(pulsePhase), 10.0);
  vec2 cellEdge = abs(fract(p) - 0.5);
  float boardGrid = smoothstep(0.48, 0.5, max(cellEdge.x, cellEdge.y));

  vec3 col = mix(uColBg, uColInk, 0.48 + boardGrid * 0.35);
  col = mix(col, uColDim, trace * 0.52);
  col = mix(col, uColSignal, trace * (0.4 + pulse * 0.48));
  col += uColAccent * pad * pulse * 0.85;
  col = mix(col, uColPaper, pad * (0.25 + pulse * 0.55));

  fragColor = vec4(col, 1.0);
}
