// An endless lattice of spheres, each cell breathing on its own phase. The
// camera drifts straight through, so new cells keep arriving out of the fog.

const float CELL = 3.2;

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float cellId(vec3 p) {
  return hash13(floor(p / CELL) + uSeed);
}

float map(vec3 p) {
  float h = cellId(p);
  vec3 q = mod(p, CELL) - CELL * 0.5;
  float r = 0.42 + 0.52 * (0.5 + 0.5 * sin(iTime * 1.3 + h * 6.2831853));
  return length(q) - r;
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

  vec3 ro = vec3(sin(iTime * 0.25) * 1.1, cos(iTime * 0.21) * 0.7, iTime * 1.2);
  vec3 rd = normalize(vec3(uv, 1.45));

  float t = 0.1;
  float hit = -1.0;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * t);
    if (d < 0.002) { hit = t; break; }
    t += d * 0.75;
    if (t > 22.0) break;
  }

  vec3 col = uColBg;
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    float h = cellId(p - n * 0.05);
    float key = max(dot(n, normalize(vec3(-0.4, 0.7, -0.5))), 0.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    // Each cell picks its own tint, so the lattice reads as a phase gradient.
    vec3 tint = mix(uColSignal, uColAccent, h);
    col = mix(uColInk, tint, key * 0.9 + 0.1);
    col += uColPaper * pow(key, 24.0) * 0.7;
    col += tint * fres * 0.6;
    col = mix(col, uColBg, smoothstep(6.0, 20.0, hit));
  }
  col += uColDim * exp(-length(uv) * 2.0) * 0.12;

  fragColor = vec4(col, 1.0);
}
