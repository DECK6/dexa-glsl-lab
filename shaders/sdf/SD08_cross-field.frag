// A grid of crosses on a repeated domain. Each cell derives its spin phase
// from its own integer id, so the field never turns in lockstep.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// iq's exact cross field. b = vec2(arm length, half thickness).
float sdCross(vec2 p, vec2 b) {
  p = abs(p);
  p = (p.y > p.x) ? p.yx : p.xy;
  vec2 q = p - b;
  float k = max(q.y, q.x);
  vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
  return sign(k) * length(max(w, 0.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec2 g = rot(iTime * 0.07) * uv * 3.4;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;

  float phase = iTime * 0.9 + (id.x * 0.73 + id.y * 1.11) + uSeed * 6.2831853;
  vec2 p = rot(phase) * gv;

  float arm = 0.30 + 0.09 * sin(phase * 0.5);
  float d = sdCross(p, vec2(arm, arm * 0.30));

  float fill = smoothstep(0.012, -0.012, d);
  float rim = smoothstep(0.016, 0.002, abs(d));
  float glow = exp(-max(d, 0.0) * 14.0);

  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(id.x * 1.3 - id.y * 0.7 + iTime * 0.4));

  vec3 col = uColBg;
  col += tint * glow * 0.8;
  col = mix(col, uColInk, fill * 0.85);
  col += tint * fill * 0.35;
  col = mix(col, uColPaper, rim * 0.9);

  // Radial falloff drops the outer ranks back toward the plate.
  col = mix(uColBg, col, smoothstep(1.5, 0.35, length(uv)) * 0.85 + 0.15);

  fragColor = vec4(col, 1.0);
}
