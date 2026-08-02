// Over-under weave: both diagonals live in every tile, and which strand
// passes on top swaps on a per-tile clock, so the basket keeps re-lacing.

float hash21(vec2 p) {
  p = fract(p * vec2(191.3, 233.7) + uSeed * 0.517);
  p += dot(p, p + 29.7);
  return fract(p.x * p.y);
}

float strand(float d, float w) {
  return smoothstep(w, w * 0.62, abs(d));
}

vec3 lay(vec3 col, float body, float shade, float shine, vec3 tint) {
  col = mix(col, uColBg * 0.2, shade);
  col = mix(col, uColInk, body);
  col = mix(col, tint, body * shine);
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.2;
  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  float h = hash21(id);
  float over = smoothstep(-0.35, 0.35, sin(iTime * 0.7 + h * 6.2832));

  float dA = abs(f.x - f.y) * 0.7071068;
  float dB = abs(f.x + f.y) * 0.7071068;

  float bodyA = strand(dA, 0.15);
  float bodyB = strand(dB, 0.15);
  float shadeA = strand(dA, 0.23) - bodyA;
  float shadeB = strand(dB, 0.23) - bodyB;

  // highlights travel along each strand axis in world space, so the sheen
  // is continuous from tile to tile
  float shineA = pow(0.5 + 0.5 * sin((p.x + p.y) * 6.5 - iTime * 2.4), 2.0);
  float shineB = pow(0.5 + 0.5 * sin((p.x - p.y) * 6.5 + iTime * 2.4), 2.0);

  vec3 base = mix(uColBg, uColDim, 0.32);
  vec3 aTop = lay(lay(base, bodyB, shadeB, shineB, uColSignal), bodyA, shadeA, shineA, uColAccent);
  vec3 bTop = lay(lay(base, bodyA, shadeA, shineA, uColAccent), bodyB, shadeB, shineB, uColSignal);

  vec3 col = mix(bTop, aTop, over);
  col += uColPaper * (bodyA * shineA + bodyB * shineB) * 0.18;

  col *= 1.0 - 0.22 * dot(uv, uv);
  fragColor = vec4(col, 1.0);
}
