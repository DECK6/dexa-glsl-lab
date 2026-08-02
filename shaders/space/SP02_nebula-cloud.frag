// Two drifting fbm layers warp one another into a luminous cloud bank.
// Sparse hashed stars remain behind the moving signal and ember density.

float sp02Hash(vec2 p) {
  p = fract(p * vec2(263.17, 419.23) + uSeed * 0.217);
  p += dot(p, p + 31.47);
  return fract(p.x * p.y);
}

float sp02Noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = sp02Hash(i);
  float b = sp02Hash(i + vec2(1.0, 0.0));
  float c = sp02Hash(i + vec2(0.0, 1.0));
  float d = sp02Hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float sp02Fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.52;
  for (int i = 0; i < 5; i++) {
    sum += amp * sp02Noise(p);
    p = p * 2.03 + vec2(8.3, 5.7);
    amp *= 0.49;
  }
  return sum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  vec2 p = uv * 2.25;

  float warpA = sp02Fbm(p * 0.72 + vec2(t * 0.045, -t * 0.031));
  float warpB = sp02Fbm(p * 0.91 + vec2(-t * 0.027, t * 0.052)
                       + vec2(warpA * 1.7, -warpA * 1.2));
  float cloudA = sp02Fbm(p + vec2(warpB, warpA) * 1.35);
  float cloudB = sp02Fbm(p * 1.58 - vec2(warpA, warpB) * 1.8
                         + vec2(-t * 0.036, t * 0.021));
  float density = smoothstep(0.24, 0.82, cloudA * 0.72 + cloudB * 0.48);
  float folds = smoothstep(0.48, 0.86, cloudB + cloudA * 0.34);

  vec2 starCell = floor((uv + uSeed * 0.019) * 105.0);
  vec2 starLocal = fract((uv + uSeed * 0.019) * 105.0) - 0.5;
  float starPick = smoothstep(0.975, 0.998, sp02Hash(starCell));
  float star = starPick * exp(-dot(starLocal, starLocal) * 190.0);

  vec3 col = mix(uColBg, uColInk, 0.42 + density * 0.46);
  col += uColDim * (0.12 + warpA * 0.17);
  col = mix(col, uColSignal, density * 0.72);
  col += uColSignal * folds * density * 0.52;
  col = mix(col, uColPaper * 1.12, smoothstep(0.68, 0.94, cloudA + folds * 0.18));
  col += uColAccent * smoothstep(0.76, 0.96, cloudB * cloudA * 1.55) * 1.15;
  col += uColPaper * star * (1.0 - density * 0.55);
  fragColor = vec4(col, 1.0);
}
