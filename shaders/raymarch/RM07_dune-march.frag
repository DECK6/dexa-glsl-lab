// Sine-sum dunes marched as a height field. The camera glides forward at a
// fixed clearance while the ridge lines migrate underneath it.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float dunes(vec2 p) {
  float h = sin(p.x * 0.42 + iTime * 0.12) * 0.75;
  h += sin(p.y * 0.31 + 1.3) * 0.55;
  h += sin((p.x + p.y) * 0.23 - iTime * 0.08 + uSeed) * 0.80;
  h += sin(p.x * 1.55 + p.y * 0.9) * 0.14;
  return h;
}

vec3 duneNormal(vec2 p) {
  vec2 e = vec2(0.06, 0.0);
  float h = dunes(p);
  return normalize(vec3(h - dunes(p + e.xy), e.x, h - dunes(p + e.yx)));
}

vec3 skyAt(vec3 rd, vec3 sun) {
  vec3 sky = mix(uColDim * 0.5, uColBg, clamp(rd.y * 1.7 + 0.22, 0.0, 1.0));
  float toward = max(dot(rd, sun), 0.0);
  sky += uColAccent * (pow(toward, 60.0) * 1.5 + pow(toward, 6.0) * 0.30);
  sky += uColSignal * pow(max(rd.y, 0.0), 2.0) * 0.10;
  return sky;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(sin(iTime * 0.15) * 3.0, 0.0, iTime * 2.2);
  ro.y = dunes(ro.xz) + 2.3;
  vec3 rd = normalize(vec3(uv, 1.5));
  rd.yz = rot(-0.10) * rd.yz;
  vec3 sun = normalize(vec3(0.32, 0.16, 1.0));

  float t = 0.3;
  float hit = -1.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = (p.y - dunes(p.xz)) * 0.45;
    if (d < 0.004 * t) { hit = t; break; }
    t += max(d, 0.04);
    if (t > 48.0) break;
  }

  vec3 col = skyAt(rd, sun);
  if (hit > 0.0) {
    vec3 p = ro + rd * hit;
    vec3 n = duneNormal(p.xz);
    float lam = max(dot(n, sun), 0.0);
    float steep = 1.0 - n.y;
    float crest = smoothstep(0.7, 1.6, p.y) * smoothstep(0.10, 0.42, steep);
    col = mix(uColInk, uColDim, lam * 0.8);
    col += uColAccent * pow(lam, 2.5) * 1.0;
    col += uColSignal * crest * 1.1;
    col = mix(col, skyAt(rd, sun), smoothstep(8.0, 44.0, hit));
  }

  fragColor = vec4(col, 1.0);
}
