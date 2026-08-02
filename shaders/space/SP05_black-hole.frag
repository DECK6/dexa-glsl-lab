// Inverse-square radial bending distorts a moving star field around the void.
// A Doppler-biased accretion disk and thin photon ring frame the horizon.

float sp05Hash(vec2 p) {
  p = fract(p * vec2(173.13, 347.91) + uSeed * 0.419);
  p += dot(p, p + 24.73);
  return fract(p.x * p.y);
}

mat2 sp05Rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  float r = length(uv);
  float bend = 1.0 + 0.075 / (r * r + 0.018);
  vec2 lensed = uv * bend + vec2(t * 0.012, -t * 0.007);

  vec2 starGrid = lensed * 72.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float starPick = smoothstep(0.972, 0.999, sp05Hash(starCell));
  float stars = starPick * exp(-dot(starLocal, starLocal) * 240.0);
  float haze = 0.5 + 0.5 * sin(lensed.x * 2.3 - lensed.y * 3.7 + t * 0.16);
  vec3 col = mix(uColBg, uColInk, 0.31 + haze * 0.12);
  col += uColPaper * stars * smoothstep(0.24, 0.42, r);

  vec2 diskUv = sp05Rotate(-0.16) * uv;
  float diskRadius = length(vec2(diskUv.x, diskUv.y * 3.45));
  float diskAngle = atan(diskUv.y * 3.45, diskUv.x);
  float diskMask = (1.0 - smoothstep(0.72, 0.86, diskRadius))
                   * smoothstep(0.285, 0.34, diskRadius);
  float bandNoise = 0.56 + 0.44 * sin(diskAngle * 19.0 - t * 1.35
                                     + sp05Hash(floor(diskUv * 34.0)) * 5.0);
  float doppler = 0.28 + 0.92 * smoothstep(-0.8, 0.75,
                                           diskUv.x / max(diskRadius, 0.001));
  float diskLight = diskMask * (0.42 + bandNoise * 0.58) * doppler;
  col += mix(uColAccent, uColPaper, smoothstep(0.72, 1.18, doppler))
         * diskLight * 1.2;

  float lensGlow = exp(-abs(r - 0.31) * 24.0);
  float photonRing = exp(-abs(r - 0.238) * 190.0);
  col += uColSignal * lensGlow * 0.32;
  col += uColSignal * photonRing * 0.8;
  col = mix(col, uColPaper * 1.45, clamp(photonRing * 1.25, 0.0, 1.0));

  float horizon = 1.0 - smoothstep(0.208, 0.218, r);
  col = mix(col, uColBg, horizon);
  fragColor = vec4(col, 1.0);
}
