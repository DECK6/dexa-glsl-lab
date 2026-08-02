// Penrose kite and dart, located by walking a deflation eight levels down: at
// every level we keep the child Robinson triangle that still holds the pixel.
// Kite halves and dart halves then blink in antiphase.

const float PHI = 1.618034;

float side(vec2 p, vec2 a, vec2 b) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

bool inside(vec2 p, vec2 a, vec2 b, vec2 c) {
  float s = sign(side(a, b, c));
  return side(p, a, b) * s >= 0.0 && side(p, b, c) * s >= 0.0 && side(p, c, a) * s >= 0.0;
}

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 e = b - a;
  vec2 v = p - a;
  return length(v - e * clamp(dot(v, e) / dot(e, e), 0.0, 1.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.05 + uSeed * 0.7;
  vec2 p = mat2(cos(t), -sin(t), sin(t), cos(t)) * uv * (1.0 + 0.06 * sin(iTime * 0.3));

  // seed half-kite: a 36° wedge wide enough to swallow the whole frame
  vec2 a = vec2(0.0, -9.0);
  vec2 b = a + 13.0 * vec2(-0.309017, 0.9510565);
  vec2 c = a + 13.0 * vec2(0.309017, 0.9510565);
  float kind = 0.0;

  for (int i = 0; i < 8; i++) {
    vec2 na, nb, nc;
    float nk;
    if (kind < 0.5) {
      vec2 q = a + (b - a) / PHI;
      vec2 r = a + (c - a) / PHI;
      if (inside(p, a, q, r)) {
        na = a; nb = q; nc = r; nk = 0.0;
      } else if (inside(p, c, q, b)) {
        na = c; nb = q; nc = b; nk = 0.0;
      } else {
        na = r; nb = q; nc = c; nk = 1.0;
      }
    } else {
      vec2 q = b + (c - b) / PHI;
      if (inside(p, b, a, q)) {
        na = b; nb = a; nc = q; nk = 0.0;
      } else {
        na = q; nb = a; nc = c; nk = 1.0;
      }
    }
    a = na; b = nb; c = nc; kind = nk;
  }

  vec2 mid = (a + b + c) / 3.0;
  float d = min(min(segDist(p, a, b), segDist(p, b, c)), segDist(p, c, a));
  float blink = 0.5 + 0.5 * sin(iTime * 1.8 + dot(mid, vec2(2.4, 1.8)) + kind * 3.1415927);

  vec3 tint = mix(uColSignal, uColAccent, kind);
  vec3 col = mix(uColInk, tint, 0.2 + 0.7 * blink);
  col *= 0.35 + 0.65 * blink;
  col = mix(uColBg, col, 0.9);
  col = mix(col, uColPaper, smoothstep(0.014, 0.004, d) * (0.3 + 0.5 * blink));

  fragColor = vec4(col, 1.0);
}
