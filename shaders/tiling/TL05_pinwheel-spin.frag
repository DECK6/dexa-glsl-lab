// Each square tile holds a four-blade pinwheel. The spin order arrives as a
// ring travelling out from the centre, so neighbours always lag one another.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 2.8;
  vec2 id = floor(p);
  vec2 g = fract(p) - 0.5;

  float lag = length(id + 0.5) * 0.75;
  float spin = iTime * 1.4 - lag + uSeed;
  float drive = 0.5 + 0.5 * sin(spin);

  float r = length(g);
  // the r term sweeps the blades back into a windmill instead of a plain cross
  float ang = atan(g.y, g.x) + spin + r * 2.4;
  float fold = mod(ang + 3.1415927, 1.5707963) - 0.7853982;

  float blade = smoothstep(0.075, 0.005, abs(fold) * r) * smoothstep(0.46, 0.36, r);
  float hub = smoothstep(0.1, 0.045, r);
  float frame = smoothstep(0.035, 0.0, 0.5 - max(abs(g.x), abs(g.y)));

  vec3 col = uColBg;
  col = mix(col, uColInk, smoothstep(0.5, 0.46, max(abs(g.x), abs(g.y))));
  col = mix(col, uColDim * 0.8, frame);
  col = mix(col, uColSignal * (0.35 + 0.65 * drive), blade);
  col = mix(col, uColAccent, hub * (0.35 + 0.65 * drive));
  col += uColPaper * blade * pow(drive, 6.0) * 0.45;

  fragColor = vec4(col, 1.0);
}
