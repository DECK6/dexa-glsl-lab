// Four hollowed cube frames nested inside one another, each on its own pair of
// rotation rates — the edges cross and uncross without the shells ever touching.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// iq's box frame: the box minus its own face interiors, leaving twelve edges.
float sdBoxFrame(vec3 p, vec3 b, float e) {
  p = abs(p) - b;
  vec3 q = abs(p + e) - e;
  return min(min(
    length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
    length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
    length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0));
}

float map(vec3 p) {
  float d = 10.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec3 q = p;
    q.xz = rot(iTime * (0.30 + fi * 0.17) + uSeed + fi) * q.xz;
    q.xy = rot(iTime * (0.21 - fi * 0.06)) * q.xy;
    float s = 0.55 + fi * 0.45;
    d = min(d, sdBoxFrame(q, vec3(s), 0.045 + fi * 0.010));
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

  vec3 ro = vec3(0.0, 0.6, -5.2);
  vec3 rd = normalize(vec3(uv, 1.8));

  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) { hit = t; break; }
    t += d * 0.9;
    if (t > 13.0) break;
  }

  float bands = 0.5 + 0.5 * sin(uv.y * 70.0 + iTime * 1.2);
  vec3 col = uColBg + uColDim * bands * 0.06;

  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.5, 0.7, -0.5))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float near = smoothstep(7.5, 3.4, hit);
    col = mix(uColInk, uColPaper, key * 0.75);
    col = mix(col, uColSignal, rim * 0.85);
    col += uColAccent * near * pow(key, 8.0) * 0.9;
    col = mix(col, uColBg, smoothstep(6.5, 12.0, hit));
  }

  fragColor = vec4(col, 1.0);
}
