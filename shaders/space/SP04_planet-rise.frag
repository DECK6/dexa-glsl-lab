// A large lower silhouette catches a layered atmospheric rim at sunrise.
// The rising disk blooms through a star field and a restrained horizontal flare.

float sp04Hash(vec2 p) {
  p = fract(p * vec2(215.43, 397.17) + uSeed * 0.337);
  p += dot(p, p + 38.21);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  vec2 planetCenter = vec2(0.0, -1.16);
  float planetRadius = 0.96;
  vec2 fromPlanet = uv - planetCenter;
  float planetDist = length(fromPlanet) - planetRadius;
  float planet = 1.0 - smoothstep(-0.012, 0.012, planetDist);

  vec2 starGrid = (uv + uSeed * 0.021) * 88.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float star = smoothstep(0.975, 0.999, sp04Hash(starCell))
               * exp(-dot(starLocal, starLocal) * 210.0);
  float skyMist = 0.5 + 0.5 * sin(uv.x * 3.1 + uv.y * 4.7 + t * 0.14 + uSeed);
  vec3 col = mix(uColBg, uColInk, 0.34 + skyMist * 0.1);
  col += uColPaper * star * (1.0 - planet);

  vec2 sunPos = vec2(-0.16 + 0.08 * sin(t * 0.12),
                     -0.08 + 0.055 * sin(t * 0.17));
  float sunDist = length(uv - sunPos);
  float visibleSky = 1.0 - planet;
  float bloom = exp(-sunDist * 5.2) * visibleSky;
  float sunDisk = (1.0 - smoothstep(0.075, 0.115, sunDist)) * visibleSky;
  float lensLine = exp(-abs(uv.y - sunPos.y) * 95.0)
                   * exp(-abs(uv.x - sunPos.x) * 1.8) * visibleSky;
  col += uColAccent * bloom * 0.72;
  col += uColSignal * bloom * bloom * 0.48;
  col = mix(col, uColPaper * 1.22, sunDisk);
  col += uColAccent * lensLine * 0.44;

  float surfaceBand = 0.5 + 0.5 * sin(atan(fromPlanet.y, fromPlanet.x) * 9.0
                                         + t * 0.13 + uSeed * 5.0);
  vec3 planetCol = mix(uColBg, uColInk, 0.62 + surfaceBand * 0.2);
  planetCol += uColDim * smoothstep(0.2, 1.0, fromPlanet.x / planetRadius) * 0.17;
  col = mix(col, planetCol, planet);

  float atmosphere = exp(-max(planetDist, 0.0) * 18.0)
                     * (1.0 - smoothstep(0.0, 0.18, max(planetDist, 0.0)));
  float rim = exp(-abs(planetDist) * 115.0);
  float warmSide = smoothstep(-0.75, 0.35, normalize(fromPlanet).x);
  vec3 rimCol = mix(uColSignal, uColAccent, warmSide * 0.72 + bloom * 0.2);
  col += rimCol * atmosphere * 0.52 + rimCol * rim * 0.88;
  fragColor = vec4(col, 1.0);
}
