// Only the edges exist. Rotating outlines glow neon and their tint rides a
// three-stop palette cycle, each shape offset a third of a turn from the last.

float sdCircle(vec2 p, float r) {
  return abs(length(p) - r);
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return abs(length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
}

float sdTri(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return length(p);
}

vec2 rot(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 cycle(float t) {
  float a = 0.5 + 0.5 * cos(6.2831 * t);
  float b = 0.5 + 0.5 * cos(6.2831 * (t - 0.3333));
  float c = 0.5 + 0.5 * cos(6.2831 * (t - 0.6667));
  a *= a; b *= b; c *= c;
  return (uColSignal * a + uColAccent * b + uColPaper * c) / (a + b + c);
}

vec3 neon(float d, vec3 tint) {
  float core = smoothstep(0.010, 0.0, d);
  float glow = exp(-d * 13.0);
  return tint * glow * 0.85 + uColPaper * core * 0.85;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float phase = iTime * 0.18 + uSeed;

  vec3 col = uColBg;
  col += neon(sdBox(rot(uv - vec2(-0.36, 0.28), iTime * 0.40), vec2(0.30, 0.22)), cycle(phase));
  col += neon(sdCircle(uv - vec2(0.38, 0.30), 0.28 + 0.05 * sin(iTime * 0.9)), cycle(phase + 0.33));
  col += neon(sdTri(rot(uv - vec2(0.02, -0.44), -iTime * 0.30), 0.34), cycle(phase + 0.66));

  // a slow outer ring ties the three shapes together
  col += neon(sdCircle(uv, 0.80 + 0.06 * sin(iTime * 0.5)), cycle(phase + 0.5)) * 0.6;

  fragColor = vec4(col, 1.0);
}
