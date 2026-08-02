// Logarithmic polar ridges form three noisy spiral arms with differential spin.
// A hot ivory bulge anchors clustered signal light inside a fading disk.

float sp03Hash(vec2 p) {
  p = fract(p * vec2(147.31, 389.73) + uSeed * 0.293);
  p += dot(p, p + 27.19);
  return fract(p.x * p.y);
}

float sp03Noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(sp03Hash(i), sp03Hash(i + vec2(1.0, 0.0)), u.x),
             mix(sp03Hash(i + vec2(0.0, 1.0)), sp03Hash(i + vec2(1.0)), u.x), u.y);
}

float sp03Fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.52;
  for (int i = 0; i < 4; i++) {
    value += amp * sp03Noise(p);
    p = p * 2.07 + vec2(6.1, 9.4);
    amp *= 0.48;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  uv.x *= 0.92;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float spin = t * (0.22 + 0.24 / (0.28 + r));
  float spiral = angle * 3.0 + log(r + 0.075) * 7.2 - spin;
  float arms = pow(0.5 + 0.5 * cos(spiral), 8.0);

  vec2 clusterUv = vec2(log(r + 0.08) * 3.2, angle * 2.4 - spin * 0.31);
  float clusters = smoothstep(0.38, 0.83, sp03Fbm(clusterUv * 2.0));
  float disk = exp(-r * 2.35) * (1.0 - smoothstep(0.18, 1.42, r));
  float armLight = arms * (0.38 + clusters * 1.15) * disk;
  float bulge = exp(-r * 7.5);
  float hotCore = exp(-r * 24.0);

  vec2 starCell = floor((uv + uSeed * 0.027) * 78.0);
  float stars = pow(sp03Hash(starCell), 30.0) * smoothstep(0.28, 1.25, r);
  float dust = sp03Fbm(uv * 2.6 + vec2(t * 0.018, -t * 0.011));

  vec3 col = mix(uColBg, uColInk, 0.32 + dust * 0.2);
  col += uColDim * disk * (0.16 + clusters * 0.22);
  col += uColSignal * armLight * 1.08;
  col = mix(col, uColPaper, clamp(armLight * clusters * 0.62 + bulge * 0.78, 0.0, 1.0));
  col += uColAccent * (hotCore * 1.18 + bulge * arms * 0.38);
  col += uColPaper * stars * 0.7;
  fragColor = vec4(col, 1.0);
}
