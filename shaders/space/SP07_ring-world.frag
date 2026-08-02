// Layered elliptical bands pass behind and in front of a shaded planet.
// Radial gaps, a cast shadow, and a hot limb give the ring system depth.

float sp07Hash(vec2 p) {
  p = fract(p * vec2(229.31, 361.79) + uSeed * 0.523);
  p += dot(p, p + 33.17);
  return fract(p.x * p.y);
}

mat2 sp07Rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  vec2 center = vec2(0.0, -0.04);
  vec2 p = uv - center;
  float planetRadius = 0.45;
  float planetR = length(p);
  float planet = 1.0 - smoothstep(planetRadius - 0.008,
                                  planetRadius + 0.008, planetR);

  vec2 starGrid = (uv + uSeed * 0.016) * 91.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float stars = smoothstep(0.979, 0.999, sp07Hash(starCell))
                * exp(-dot(starLocal, starLocal) * 230.0);
  vec3 col = mix(uColBg, uColInk, 0.34 + 0.08 * sin(uv.y * 4.0 + t * 0.11));
  col += uColPaper * stars * 0.65;

  vec2 ringP = sp07Rotate(0.22) * p;
  float ringR = length(vec2(ringP.x, ringP.y / 0.29));
  float ringEnvelope = (1.0 - smoothstep(0.94, 0.99, ringR))
                       * smoothstep(0.56, 0.61, ringR);
  float grain = sp07Hash(vec2(floor(ringR * 92.0), floor(ringP.x * 9.0)));
  float bands = 0.3 + 0.7 * pow(0.5 + 0.5 * sin(ringR * 118.0
                                               + grain * 5.0 - t * 0.28), 2.0);
  float ring = ringEnvelope * bands;
  vec3 ringCol = mix(uColSignal, uColPaper, 0.28 + bands * 0.58);
  float backRing = ring * step(0.0, ringP.y);
  col = mix(col, ringCol, clamp(backRing * 0.86, 0.0, 1.0));

  float z = sqrt(max(planetRadius * planetRadius - planetR * planetR, 0.0));
  vec3 normal = normalize(vec3(p, z));
  vec3 lightDir = normalize(vec3(-0.65, 0.55, 0.85));
  float light = 0.18 + 0.82 * smoothstep(-0.35, 0.75, dot(normal, lightDir));
  float surface = 0.5 + 0.5 * sin(atan(p.y, p.x) * 7.0
                                     + p.y * 18.0 - t * 0.16 + uSeed * 4.0);
  vec3 planetCol = mix(uColInk, uColDim, light * (0.55 + surface * 0.18));
  col = mix(col, planetCol, planet);

  float ringShadow = planet * exp(-abs(ringP.y + 0.055) * 42.0)
                     * (1.0 - smoothstep(0.02, 0.38, abs(ringP.x)));
  col = mix(col, uColBg, ringShadow * 0.58);
  float hotLimb = planet * pow(1.0 - z / planetRadius, 4.0)
                  * smoothstep(0.1, 0.8, dot(normal, lightDir));
  col += uColAccent * hotLimb * 0.72;

  float frontRing = ring * step(ringP.y, 0.0);
  col = mix(col, ringCol * 1.08, clamp(frontRing, 0.0, 1.0));
  fragColor = vec4(col, 1.0);
}
