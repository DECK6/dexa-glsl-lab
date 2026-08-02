// Polar log-space cells launch hashed stars from the vanishing point.
// Compact paper cores pull long signal tails with rare hot accents.

float sp01Hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed * 0.173);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);

  vec2 polar = vec2((angle + 3.1415927) / 6.2831853 * 84.0,
                    log(r + 0.035) * 5.4 - t * 0.72);
  vec2 cell = floor(polar);
  vec2 local = fract(polar);
  vec2 rnd = vec2(sp01Hash(cell), sp01Hash(cell + vec2(17.0, 9.0)));
  float chosen = smoothstep(0.72, 0.98, sp01Hash(cell + vec2(5.0, 31.0)));

  float angularGap = local.x - rnd.x;
  float radialGap = local.y - rnd.y;
  float core = exp(-angularGap * angularGap * 720.0
                   - radialGap * radialGap * 640.0) * chosen;
  float behind = rnd.y - local.y;
  float tail = exp(-angularGap * angularGap * 300.0 - behind * 7.0)
               * step(0.0, behind) * step(behind, 0.68) * chosen;
  float launch = smoothstep(0.035, 0.24, r) * (1.0 - smoothstep(0.28, 1.45, r));
  core *= launch;
  tail *= launch * smoothstep(0.08, 0.85, r);

  vec2 dustCell = floor((uv + uSeed * 0.013) * 92.0);
  float dust = pow(sp01Hash(dustCell), 24.0);
  float haze = 0.5 + 0.5 * sin(angle * 4.0 - r * 8.0 + t * 0.18);
  vec3 col = mix(uColBg, uColInk, 0.34 + haze * 0.18);
  col += uColDim * dust * 0.32;
  col += uColSignal * (tail * 1.25 + core * 0.45);
  col = mix(col, uColPaper * 1.25, clamp(core * 1.4, 0.0, 1.0));

  float rare = smoothstep(0.94, 0.995, sp01Hash(cell + vec2(61.0, 3.0)));
  col += uColAccent * rare * (core * 1.35 + tail * 0.42);
  col += uColSignal * exp(-r * 9.0) * 0.18;
  fragColor = vec4(col, 1.0);
}
