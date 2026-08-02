// Ink dispersing in water: a compact blot branches into lobes, curls at the
// boundary, and leaves a translucent cyan stain around its paper-bright core.

float hash21(vec2 p) {
  p = fract(p * vec2(127.11, 311.7) + uSeed * 0.37);
  p += dot(p, p + 34.53);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float breathe = 0.82 + 0.16 * sin(iTime * 0.43);
  vec2 q = uv / breathe;
  float warpX = valueNoise(q * 2.1 + vec2(iTime * 0.11, 7.0));
  float warpY = valueNoise(q * 2.3 + vec2(13.0, -iTime * 0.09));
  q += (vec2(warpX, warpY) - 0.5) * 0.52;

  float angle = atan(q.y, q.x);
  float radius = length(q);
  float lobedRadius = 0.5 + 0.16 * sin(angle * 5.0 + iTime * 0.7)
    + 0.09 * sin(angle * 9.0 - iTime * 0.44 + uSeed);
  float edge = radius - lobedRadius;
  float body = smoothstep(0.16, -0.28, edge);
  float curl = valueNoise(q * 6.0 - iTime * 0.2) * smoothstep(0.24, -0.04, abs(edge));
  float density = body * (0.45 + curl * 0.85);
  float contour = exp(-abs(edge) * 18.0) * (0.35 + 0.65 * curl);

  vec3 col = mix(uColBg, uColInk, 0.36 + 0.1 * valueNoise(uv * 1.4 + iTime * 0.03));
  col = mix(col, uColDim, smoothstep(0.04, 0.48, density));
  col = mix(col, uColPaper, smoothstep(0.5, 1.08, density) * 0.78);
  col += uColSignal * contour * 0.52;
  col += uColAccent * smoothstep(0.86, 1.18, density) * 0.42;

  fragColor = vec4(col, 1.0);
}
