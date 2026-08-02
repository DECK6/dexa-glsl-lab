// A repeated field of capsules falling on per-column speeds. The camera orbits
// slowly, so the columns shear against each other instead of reading as a grid.

float sdCapsule(vec3 p, float h, float r) {
  p.y -= clamp(p.y, -h, h);
  return length(p) - r;
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float map(vec3 p) {
  vec2 cell = vec2(1.5);
  float h = hash12(floor(p.xz / cell) + uSeed);
  vec2 q = mod(p.xz, cell) - cell * 0.5;
  q += (vec2(h, fract(h * 57.3)) - 0.5) * 0.7;
  float fall = p.y + iTime * (2.2 + h * 2.6) + h * 30.0;
  return sdCapsule(vec3(q.x, mod(fall, 3.0) - 1.5, q.y), 0.42, 0.075);
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float a = iTime * 0.18 + uSeed;
  vec3 ro = vec3(sin(a) * 4.2, 0.5, cos(a) * 4.2);
  vec3 f = normalize(-ro + vec3(0.0, 0.4, 0.0));
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 rd = normalize(uv.x * r + uv.y * cross(f, r) + 1.5 * f);

  float t = 0.1;
  float hit = -1.0;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < 0.002) { hit = t; break; }
    t += d * 0.7;
    if (t > 18.0) break;
  }

  // Vertical streaks under the field imply the fall the stills cannot show.
  float streak = exp(-abs(sin(uv.x * 24.0 + uSeed * 9.0)) * 6.0);
  vec3 col = uColBg + uColDim * streak * 0.10;

  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float key = max(dot(n, normalize(vec3(0.3, 0.85, -0.4))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float depth = smoothstep(2.0, 15.0, hit);
    col = mix(uColInk, uColSignal, key * 0.95);
    col += uColPaper * pow(key, 26.0) * 0.8;
    col += uColAccent * rim * 0.75;
    col = mix(col, uColBg, depth);
  }

  fragColor = vec4(col, 1.0);
}
