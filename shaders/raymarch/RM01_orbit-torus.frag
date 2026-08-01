// Raymarched torus with an orbiting sphere — the hello-world of SDF scenes.
// March from a fixed camera, shade with a two-light setup in the DEXA palette.

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float map(vec3 p) {
  vec3 q = p;
  q.xy = rot(iTime * 0.4 + uSeed) * q.xy;
  q.yz = rot(iTime * 0.3) * q.yz;
  float torus = sdTorus(q, vec2(1.0, 0.35));
  vec3 orbit = vec3(cos(iTime * 1.2) * 1.6, sin(iTime * 0.9) * 0.6, sin(iTime * 1.2) * 1.6);
  float ball = sdSphere(p - orbit, 0.3);
  return min(torus, ball);
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

  vec3 ro = vec3(0.0, 0.0, -3.6);
  vec3 rd = normalize(vec3(uv, 1.6));

  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) { hit = t; break; }
    t += d;
    if (t > 12.0) break;
  }

  vec3 col = uColBg;
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.6, 0.8, -0.4))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    col = mix(uColInk, uColSignal, key);
    col += uColAccent * rim * 0.8;
    col = mix(col, uColBg, smoothstep(6.0, 11.0, hit));
  }

  // Subtle vignette keeps the bezel framing consistent across the catalog.
  float vig = smoothstep(1.6, 0.4, length(uv));
  col = mix(uColBg, col, vig);

  fragColor = vec4(col, 1.0);
}
