// Rhombille tiling read as isometric cubes: three rhombi per hexagon, shaded as
// three faces. The light steps face to face while the field drifts upward.

const vec2 HEX = vec2(1.0, 1.7320508);

vec4 hexCell(vec2 p) {
  vec2 a = mod(p, HEX) - HEX * 0.5;
  vec2 b = mod(p - HEX * 0.5, HEX) - HEX * 0.5;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return vec4(g, p - g);
}

float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, normalize(HEX)), p.x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 2.6 + vec2(0.0, iTime * 0.4);

  vec4 cell = hexCell(p);
  vec2 g = cell.xy;
  vec2 id = cell.zw;

  float r = length(g);
  // spokes run to the hex vertices at 90°, 210°, 330° — that split is the cube
  float turn = mod(atan(g.y, g.x) - 1.5707963 + 6.2831853, 6.2831853);
  float faceId = floor(turn / 2.0943951);
  float local = mod(turn, 2.0943951);
  float spoke = r * min(sin(local), sin(2.0943951 - local));

  float shade = faceId < 0.5 ? 0.95 : (faceId < 1.5 ? 0.5 : 0.22);
  float step = 0.5 + 0.5 * sin(iTime * 1.9 - faceId * 2.0943951 + dot(id, vec2(0.9, 0.5)));

  float seam = smoothstep(0.05, 0.0, min(0.5 - hexDist(g), spoke));

  vec3 col = mix(uColInk, uColPaper, shade * 0.75);
  col = mix(col, uColSignal, (0.2 + 0.5 * step) * (0.35 + 0.65 * shade));
  col += uColAccent * pow(step, 4.0) * shade * 0.55;
  col = mix(col, uColBg, seam);

  fragColor = vec4(col, 1.0);
}
