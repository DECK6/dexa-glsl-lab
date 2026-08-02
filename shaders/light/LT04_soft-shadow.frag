// A pale rotating tile hovers over a dim plane and drags a broad soft shadow.
// Layered offset silhouettes make the cast edge dissolve with distance.

mat2 shadowRot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float roundedBox(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float phase = iTime * 0.43 + uSeed * 5.2 + 0.55;
  mat2 turn = shadowRot(phase);
  vec2 lightDir = normalize(vec2(0.72 + 0.18 * sin(iTime * 0.37), -0.58));
  float shadow = 0.0;

  for (int i = 0; i < 12; i++) {
    float fi = float(i) / 11.0;
    vec2 samplePoint = turn * (uv + lightDir * (0.10 + fi * 0.58));
    float shape = roundedBox(samplePoint, vec2(0.34, 0.22), 0.08 + fi * 0.035);
    shadow += smoothstep(0.055 + fi * 0.025, -0.035, shape) * (1.0 - fi * 0.55);
  }
  shadow /= 8.4;

  vec2 objectPoint = turn * uv;
  float object = smoothstep(0.012, -0.012, roundedBox(objectPoint, vec2(0.34, 0.22), 0.08));
  float rim = exp(-abs(roundedBox(objectPoint, vec2(0.34, 0.22), 0.08)) * 38.0);
  float plane = 0.10 * (0.5 + 0.5 * sin((uv.x + uv.y) * 8.0 - iTime * 0.4));

  vec3 col = mix(uColBg, uColDim, 0.28 + plane);
  col = mix(col, uColBg, shadow * 0.88);
  col = mix(col, uColPaper, object * 0.92);
  col += uColSignal * rim * object * 0.32;
  col += uColAccent * rim * (1.0 - object) * 0.18;
  fragColor = vec4(col, 1.0);
}
