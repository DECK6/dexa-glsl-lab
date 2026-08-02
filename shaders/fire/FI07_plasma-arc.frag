// An unstable plasma bridge between two electrodes. Harmonic bends split into
// a cyan corona and an orange core while travelling knots race end to end.

float hash11(float p) {
  return fract(sin(p * 91.71 + uSeed * 23.17) * 43758.5453);
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b - a;
  return length(p - a - edge * clamp(dot(p - a, edge) / dot(edge, edge), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float x01 = clamp(uv.x * 0.58 + 0.5, 0.0, 1.0);
  float clock = floor(iTime * 15.0);
  float jitter = (hash11(floor(x01 * 34.0) + clock) - 0.5) * 0.11;
  float arcY = sin(x01 * 9.0 + iTime * 4.1) * 0.10
    + sin(x01 * 23.0 - iTime * 6.2) * 0.035 + jitter;
  float distanceToArc = abs(uv.y - arcY);
  float envelope = smoothstep(-0.92, -0.72, uv.x) * smoothstep(0.92, 0.72, uv.x);
  float corona = exp(-distanceToArc * 17.0) * envelope;
  float core = exp(-distanceToArc * 95.0) * envelope;
  float knot = pow(0.5 + 0.5 * sin(x01 * 31.0 - iTime * 11.0), 8.0);

  float leftRod = segmentDistance(uv, vec2(-0.98, -0.42), vec2(-0.86, 0.42));
  float rightRod = segmentDistance(uv, vec2(0.98, -0.42), vec2(0.86, 0.42));
  float electrode = smoothstep(0.085, 0.04, min(leftRod, rightRod));

  vec3 col = mix(uColBg, uColInk, 0.32 + 0.18 * exp(-abs(uv.y) * 2.0));
  col = mix(col, uColDim, electrode * 0.8);
  col += uColSignal * corona * (0.65 + knot * 0.7);
  col += uColAccent * core * (0.75 + knot * 1.2);
  col = mix(col, uColPaper, clamp(core * (0.75 + knot), 0.0, 1.0));
  col += uColAccent * electrode * core * 0.8;

  fragColor = vec4(col, 1.0);
}
