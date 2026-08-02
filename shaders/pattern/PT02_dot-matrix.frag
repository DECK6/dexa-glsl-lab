// A square matrix of dots. Concentric wave fronts leave a slowly orbiting
// source and pump each dot's radius and brightness as they pass over it.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float cells = 13.0;
  vec2 grid = uv * cells;
  vec2 cell = floor(grid);
  vec2 local = fract(grid) - 0.5;

  // The wave is sampled at the cell centre, so a whole dot pulses as one unit.
  vec2 centre = (cell + 0.5) / cells;
  vec2 source = vec2(sin(iTime * 0.37 + uSeed * 6.2831853), cos(iTime * 0.29)) * 0.7;
  float dist = length(centre - source);

  float pump = 0.5 + 0.5 * sin(dist * 14.0 - iTime * 2.6);

  float radius = mix(0.10, 0.40, pump);
  float d = length(local) - radius;

  float core = smoothstep(0.03, -0.02, d);
  float halo = exp(-max(d, 0.0) * 12.0) * pump;

  // A second, slower ring set slides the tint between signal and accent.
  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(dist * 6.0 - iTime * 0.9));

  vec3 col = mix(uColBg, uColInk, 0.25);
  col += tint * halo * 0.55;
  col = mix(col, tint, core * 0.85);
  col = mix(col, uColPaper, core * pow(pump, 3.0) * 0.7);

  fragColor = vec4(col, 1.0);
}
