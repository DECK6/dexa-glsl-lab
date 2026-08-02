// Boiling granular noise shades a giant stellar surface below the horizon.
// Noisy elliptical prominences rise through a cool corona with white-hot cores.

float sp10Hash(vec2 p) {
  p = fract(p * vec2(241.37, 409.19) + uSeed * 0.659);
  p += dot(p, p + 34.67);
  return fract(p.x * p.y);
}

float sp10Noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(sp10Hash(i), sp10Hash(i + vec2(1.0, 0.0)), u.x),
             mix(sp10Hash(i + vec2(0.0, 1.0)), sp10Hash(i + vec2(1.0)), u.x), u.y);
}

float sp10Fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.54;
  for (int i = 0; i < 4; i++) {
    value += amp * sp10Noise(p);
    p = p * 2.06 + vec2(7.4, 5.9);
    amp *= 0.47;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  vec2 sunCenter = vec2(0.0, -0.98);
  float sunRadius = 1.12;
  vec2 sunP = uv - sunCenter;
  float sunDist = length(sunP) - sunRadius;
  float surfaceMask = 1.0 - smoothstep(-0.008, 0.012, sunDist);

  vec2 starGrid = (uv + uSeed * 0.017) * 90.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float stars = smoothstep(0.983, 0.999, sp10Hash(starCell))
                * exp(-dot(starLocal, starLocal) * 225.0);
  vec3 col = mix(uColBg, uColInk, 0.35 + 0.08 * sin(uv.x * 3.0 + t * 0.1));
  col += uColPaper * stars * (1.0 - surfaceMask) * 0.5;

  float corona = exp(-max(sunDist, 0.0) * 5.0) * (1.0 - surfaceMask);
  float rays = pow(0.5 + 0.5 * sin(atan(sunP.y, sunP.x) * 17.0
                                      + t * 0.22 + uSeed * 3.0), 3.0);
  col += uColSignal * corona * (0.22 + rays * 0.22);
  col += uColAccent * exp(-max(sunDist, 0.0) * 16.0) * (1.0 - surfaceMask) * 0.5;

  float granules = sp10Fbm(sunP * 7.2 + vec2(t * 0.16, -t * 0.11));
  float cells = 0.5 + 0.5 * sin(granules * 21.0 + sunP.x * 7.0 - t * 0.8);
  vec3 surfaceCol = mix(uColAccent, uColPaper, smoothstep(0.58, 0.96, cells) * 0.62);
  surfaceCol = mix(uColInk, surfaceCol, 0.68 + granules * 0.3);
  col = mix(col, surfaceCol, surfaceMask);

  float flareHeight = 0.55 + 0.085 * sin(t * 0.43 + uSeed * 0.23);
  vec2 archP = vec2((uv.x - 0.08) / 0.56, (uv.y - 0.10) / flareHeight);
  float archAngle = atan(archP.y, archP.x);
  float archNoise = 0.022 * sin(archAngle * 13.0 - t * 1.05
                               + sp10Noise(uv * 9.0) * 6.0);
  float archDist = abs(length(archP) - 1.0 + archNoise);
  float upper = smoothstep(0.07, 0.17, uv.y);
  float energy = 0.68 + 0.32 * sin(t * 0.38 + 1.1);
  float archGlow = exp(-archDist * 18.0) * upper * energy;
  float archCore = exp(-archDist * 92.0) * upper * energy;
  float thread = exp(-abs(archDist - 0.055) * 42.0) * upper;
  col += uColAccent * archGlow * 1.08;
  col += uColSignal * thread * 0.34;
  col = mix(col, uColPaper * 1.35, clamp(archCore, 0.0, 1.0));
  fragColor = vec4(col, 1.0);
}
