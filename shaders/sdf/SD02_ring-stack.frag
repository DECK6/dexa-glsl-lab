// Concentric rings from a single repeated radial field. Each ring's half-width
// is driven by a wave that travels outward and around, so the stack breathes.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float spacing = 0.115;
  float idx = floor(r / spacing);

  // Thickness wave: radial index sets the phase, angle adds the swirl.
  float wave = sin(iTime * 1.7 - idx * 0.85 + a * 3.0 + uSeed * 6.2831853);
  float w = 0.010 + 0.030 * (0.5 + 0.5 * wave);

  float d = abs(mod(r, spacing) - spacing * 0.5) - w;

  float core = smoothstep(0.005, -0.003, d);
  float glow = exp(-max(d, 0.0) * 24.0);

  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(idx * 0.8 + iTime * 0.5));

  vec3 col = uColBg;
  col += tint * glow * 0.95;
  col = mix(col, uColPaper, core * 0.85);

  // Hot center and a soft outer fade keep the stack anchored in the frame.
  col += uColAccent * exp(-r * 9.0) * (0.35 + 0.35 * sin(iTime * 2.4));
  col = mix(col, uColBg, smoothstep(0.85, 1.45, r));

  fragColor = vec4(col, 1.0);
}
