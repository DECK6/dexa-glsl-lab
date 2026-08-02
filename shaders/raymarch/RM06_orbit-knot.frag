// Eight torus links threaded into a closed chain — neighbours alternate between
// the radial and the upright plane, so every pair interlocks as the loop tumbles.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float map(vec3 p) {
  p.xz = rot(iTime * 0.45) * p.xz;
  p.yz = rot(0.55 + sin(iTime * 0.33 + uSeed) * 0.35) * p.yz;

  float radius = 1.55 + 0.10 * sin(iTime * 0.7);
  vec2 tube = vec2(0.5, 0.14);
  float d = 10.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec3 q = p;
    q.xz = rot(fi * 0.7853982) * q.xz;
    q.x -= radius;
    q.xy = rot(sin(iTime * 0.9 + fi * 0.8) * 0.2) * q.xy;
    d = min(d, mod(fi, 2.0) < 0.5 ? sdTorus(q, tube) : sdTorus(q.zxy, tube));
  }
  return d;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0, 0.0, -4.4);
  vec3 rd = normalize(vec3(uv, 1.7));

  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) { hit = t; break; }
    t += d;
    if (t > 12.0) break;
  }

  // The orbit the chain traces stays faintly printed on the backdrop.
  float ring = exp(-abs(length(uv) - 0.72) * 9.0);
  vec3 col = uColBg + uColDim * ring * 0.35;

  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.4, 0.8, -0.45))), 0.0);
    float fill = max(dot(n, normalize(vec3(-0.6, -0.2, -0.5))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.5);
    col = mix(uColInk, uColSignal, key);
    col += uColAccent * fill * 0.55;
    col += uColPaper * pow(key, 30.0) * 0.8;
    col += uColAccent * rim * 0.7;
    col = mix(col, uColBg, smoothstep(5.5, 10.0, hit));
  }

  fragColor = vec4(col, 1.0);
}
