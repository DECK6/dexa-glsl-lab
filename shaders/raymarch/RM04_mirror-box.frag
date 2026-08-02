// Kaleidoscopic box folding: five abs()-fold-and-scale passes turn one box into
// a mirrored room. The fold rotation drifts, so the corridors keep re-cutting.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  float scale = 1.0;
  float spin = iTime * 0.13 + uSeed;
  for (int i = 0; i < 5; i++) {
    p = abs(p) - vec3(1.15, 0.85, 1.15);
    p.xz = rot(0.45 + spin) * p.xz;
    p.xy = rot(0.22 - spin * 0.45) * p.xy;
    p *= 1.42;
    scale *= 1.42;
  }
  return sdBox(p, vec3(1.0)) / scale;
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

  vec3 ro = vec3(0.0, 0.4, -4.6);
  ro.xz = rot(iTime * 0.2) * ro.xz;
  vec3 f = normalize(-ro);
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 rd = normalize(uv.x * r + uv.y * cross(f, r) + 1.6 * f);

  float t = 0.1;
  float hit = -1.0;
  float march = 0.0;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    march += 1.0;
    if (d < 0.0012) { hit = t; break; }
    t += d * 0.85;
    if (t > 14.0) break;
  }

  vec3 col = uColBg + uColDim * (0.5 - 0.5 * uv.y) * 0.10;
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    vec3 refl = reflect(rd, n);
    float key = max(dot(n, normalize(vec3(0.5, 0.8, -0.3))), 0.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
    // Faces behave like polished panels: the bounce direction picks the tint.
    vec3 mirror = mix(uColSignal, uColPaper, 0.5 + 0.5 * refl.y);
    col = mix(uColInk, mirror, 0.28 + 0.55 * key);
    col += uColAccent * fres * 1.1;
    col *= 1.0 - march / 160.0;
    col = mix(col, uColBg, smoothstep(6.0, 13.0, hit));
  }

  float vig = smoothstep(1.7, 0.4, length(uv));
  col = mix(uColBg, col, 0.35 + 0.65 * vig);

  fragColor = vec4(col, 1.0);
}
