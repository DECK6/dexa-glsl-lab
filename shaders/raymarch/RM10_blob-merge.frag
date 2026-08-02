// Six metaballs on independent orbits, joined by a smooth-min whose blend width
// breathes — the cluster fuses into one body and tears back apart on a cycle.

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  float k = 0.30 + 0.32 * (0.5 + 0.5 * sin(iTime * 0.55));
  float d = 10.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float a = iTime * (0.5 + fi * 0.11) + fi * 1.0471976 + uSeed * 6.2831853;
    float swell = 0.75 + 0.55 * sin(iTime * 0.4 + fi * 1.7);
    vec3 c = vec3(cos(a) * 1.15, sin(a * 1.3) * 0.85, sin(a * 0.7) * 1.15) * swell;
    d = smin(d, length(p - c) - (0.40 + 0.10 * sin(iTime + fi)), k);
  }
  return d;
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

  vec3 ro = vec3(0.0, 0.0, -4.3);
  vec3 rd = normalize(vec3(uv, 1.6));

  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0015) { hit = t; break; }
    t += d * 0.9;
    if (t > 11.0) break;
  }

  vec3 col = uColBg + uColSignal * exp(-length(uv) * 2.4) * 0.12;

  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = normalAt(p);
    vec3 light = normalize(vec3(0.5, 0.8, -0.5));
    float lam = max(dot(n, light), 0.0);
    float spec = pow(max(dot(n, normalize(light - rd)), 0.0), 44.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    col = mix(uColInk, uColSignal, lam * 0.85);
    col += uColPaper * spec * 0.95;
    col += uColAccent * fres * 0.85;
    col = mix(col, uColBg, smoothstep(5.5, 9.5, hit));
  }

  fragColor = vec4(col, 1.0);
}
