// A five-point star bouncing on a floor line. Contact squashes the shape and
// flares the glow — the whole piece is timed off one abs(sin) arc.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// iq's star field: n points, m controls how sharp they are (2 < m <= n).
float sdStar(vec2 p, float r, float n, float m) {
  float an = 3.141593 / n;
  float en = 3.141593 / m;
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));

  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float t = iTime * 1.8 + uSeed * 3.0;
  float arc = abs(sin(t));
  float impact = pow(1.0 - arc, 6.0);

  float cx = sin(iTime * 0.55) * 0.46;
  float cy = -0.56 + arc * 0.92;

  vec2 p = uv - vec2(cx, cy);
  p = rot(iTime * 0.9) * p;
  p.x /= 1.0 + impact * 0.32;
  p.y /= 1.0 - impact * 0.26;

  float d = sdStar(p, 0.30, 5.0, 2.6);

  float core = smoothstep(0.008, -0.006, d);
  float glow = exp(-max(d, 0.0) * 12.0) * (0.55 + 1.1 * impact);
  float edge = smoothstep(0.012, 0.0, abs(d));

  float ground = abs(uv.y + 0.62);
  float line = exp(-ground * 34.0) * 0.6;
  float shadow = exp(-length((uv - vec2(cx, -0.62)) * vec2(2.4, 10.0)) * 2.6) * (0.2 + 0.7 * impact);

  vec3 col = uColBg;

  // Three fading echoes trace the arc the star just came through.
  for (int i = 1; i <= 3; i++) {
    float back = float(i) * 0.30;
    float ga = abs(sin(t - back));
    vec2 gp = uv - vec2(sin((iTime - back / 1.8) * 0.55) * 0.46, -0.56 + ga * 0.92);
    gp = rot((iTime - back / 1.8) * 0.9) * gp;
    float gd = sdStar(gp, 0.30, 5.0, 2.6);
    col += uColSignal * exp(-max(gd, 0.0) * 16.0) * (0.26 / float(i));
  }

  col += uColDim * line;
  col += uColAccent * shadow * 0.8;
  col += uColSignal * glow;
  col = mix(col, uColInk, core * 0.8);
  col += uColAccent * core * impact * 0.9;
  col = mix(col, uColPaper, edge);

  fragColor = vec4(col, 1.0);
}
