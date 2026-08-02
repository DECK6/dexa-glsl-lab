// A gyroid surface inflated into a hollow corridor system. The camera flies
// straight down +z, so walls peel open and close again around the view.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Empty space is the slab around the implicit surface — the hall itself.
float hall(vec3 p, float s, float thick) {
  p *= s;
  return (thick - abs(dot(sin(p), cos(p.zxy)))) / s;
}

float map(vec3 p) {
  p.xy = rot(sin(iTime * 0.17 + uSeed) * 0.45) * p.xy;
  float thick = 0.72 + 0.20 * sin(iTime * 0.5);
  float d = hall(p, 1.5, thick);
  // Ribbed relief so the walls read as built rather than poured.
  d -= 0.035 * sin(p.x * 5.0) * sin(p.y * 5.0) * sin(p.z * 5.0);
  return d * 0.6;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0, 0.0, iTime * 0.7 + uSeed * 4.0);
  vec3 rd = normalize(vec3(uv, 1.5));
  rd.xz = rot(sin(iTime * 0.23) * 0.22) * rd.xz;

  float t = 0.05;
  float hit = -1.0;
  float march = 0.0;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * t);
    march += 1.0;
    if (d < 0.0015) { hit = t; break; }
    t += d * 0.85;
    if (t > 9.0) break;
  }

  vec3 col = uColBg;
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.3, 0.75, -0.6))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.2);
    col = mix(uColInk, uColDim, key * 0.75);
    col += uColSignal * rim * 1.2;
    col += uColAccent * pow(key, 5.0) * 0.4;
    col = mix(col, uColBg, smoothstep(2.5, 8.0, hit));
  }
  // Deep pockets take more steps to resolve, and glow faintly from within.
  col += uColSignal * (march / 90.0) * 0.14;

  fragColor = vec4(col, 1.0);
}
