// Low flight through a column forest. Every column is smooth-min'd into the
// ground plane, so the bases pool outward instead of meeting at a hard seam.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float map(vec3 p) {
  float ground = p.y + 1.2;
  vec2 cell = vec2(3.4);
  float h = hash12(floor(p.xz / cell) + uSeed);
  vec2 q = mod(p.xz, cell) - cell * 0.5;
  q += (vec2(h, fract(h * 41.7)) - 0.5) * 1.4;
  float column = length(q) - (0.22 + 0.30 * h);
  // Columns swell and pinch along their height so nothing looks extruded.
  column += sin(p.y * 1.1 + h * 6.2831853 + iTime * 0.6) * 0.09;
  return smin(ground, column, 0.75);
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.003, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0, -0.35 + sin(iTime * 0.7) * 0.08, iTime * 1.7 + uSeed * 5.0);
  vec3 rd = normalize(vec3(uv, 1.6));
  rd.xz = rot(sin(iTime * 0.2) * 0.22) * rd.xz;

  // Horizon glow doubles as the fog target, which keeps the depth cue honest.
  vec3 sky = mix(uColAccent * 0.35, uColBg, smoothstep(-0.02, 0.5, rd.y));
  sky += uColSignal * smoothstep(0.15, 0.9, rd.y) * 0.12;

  float t = 0.1;
  float hit = -1.0;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < 0.003) { hit = t; break; }
    t += d * 0.8;
    if (t > 30.0) break;
  }

  vec3 col = sky;
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.45, 0.55, 0.7))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float up = smoothstep(-1.2, 0.9, p.y);
    col = mix(uColInk, uColDim, key * 0.6);
    col += uColSignal * rim * (0.35 + 0.9 * up);
    col += uColAccent * key * up * 0.5;
    col = mix(col, sky, smoothstep(4.0, 26.0, hit));
  }

  fragColor = vec4(col, 1.0);
}
