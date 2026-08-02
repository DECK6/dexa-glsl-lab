// An Apollonian-style packing built from a fold-and-invert loop: wrap the plane
// into a unit cell, invert through the origin, repeat. Every level leaves a
// tangent circle behind. The inversion strength drifts on a slow sine, so the
// circles swell, trade places and repack without ever settling.

float packing(vec2 p, float s, out float glow) {
  float trap = 1e9;
  float amp = 1.0;
  glow = 0.0;
  for (int i = 0; i < 10; i++) {
    p = -1.0 + 2.0 * fract(0.5 * p + 0.5);
    float k = s / clamp(dot(p, p), 0.02, 4.0);
    p *= k;
    float rim = abs(length(p) - 1.0);
    trap = min(trap, rim);
    glow += amp * exp(-rim * 7.0);
    amp *= 0.90;
  }
  return trap;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 1.25 + vec2(iTime * 0.035, -iTime * 0.021) + uSeed;

  float s = 1.18 + 0.14 * sin(iTime * 0.19 + uSeed);
  float glow = 0.0;
  float trap = packing(p, s, glow);
  glow /= 1.0 + glow;

  vec3 col = mix(uColBg, uColInk, 0.6);
  col += uColSignal * glow * 1.05;
  col += uColAccent * exp(-trap * 24.0) * 0.85;
  col = mix(col, uColPaper, smoothstep(0.014, 0.0, trap) * 0.85);

  fragColor = vec4(col, 1.0);
}
