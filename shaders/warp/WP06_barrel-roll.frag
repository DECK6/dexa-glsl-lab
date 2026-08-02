// Barrel distortion breathing between barrel and pincushion while the whole
// frame rolls. A checkerboard is the honest test pattern for it — the cell
// edges bow outward and snap back through flat.

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

vec2 barrel(vec2 p, float k) {
  float r2 = dot(p, p);
  return p * (1.0 + k * r2 + k * 0.4 * r2 * r2);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float roll = iTime * 0.35 + uSeed;
  float k = 0.8 * sin(iTime * 0.5 + uSeed * 2.0);

  vec2 w = barrel(uv * rot(roll), k);

  float n = 3.5;
  vec2 cell = floor(w * n);
  float checker = mod(cell.x + cell.y, 2.0);

  vec2 g = abs(fract(w * n) - 0.5);
  float edge = smoothstep(0.42, 0.5, max(g.x, g.y));
  float ring = smoothstep(0.44, 0.5, abs(fract(length(w) * 2.5 - iTime * 0.3) - 0.5));

  vec3 col = mix(uColBg, uColDim * 0.55, checker);
  col = mix(col, uColInk, (1.0 - checker) * 0.5);
  col = mix(col, uColSignal, edge * 0.9);
  col = mix(col, uColPaper, edge * checker * 0.55);
  col += uColAccent * ring * (0.2 + 0.55 * abs(k)) * (1.0 - 0.5 * checker);

  fragColor = vec4(col, 1.0);
}
