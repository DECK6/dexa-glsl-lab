// Quarter-arc Truchet corridors with a signal running the loops. Tile
// orientation is hashed with uSeed, so REGENERATE redraws the whole maze.

const float PI = 3.14159265;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.173);
  p += dot(p, p + 41.7);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.0 + vec2(iTime * 0.09, iTime * 0.05);

  vec2 id = floor(p);
  vec2 g = fract(p);
  if (hash21(id) > 0.5) g.x = 1.0 - g.x;

  float dA = length(g - vec2(0.0, 1.0));
  float dB = length(g - vec2(1.0, 0.0));
  float d = abs(min(dA, dB) - 0.5);

  // Arc-length phase runs 0..1 per quarter and stays continuous across the
  // tile seams, so the dashes read as one signal flowing the corridors.
  vec2 r = dA < dB ? g - vec2(0.0, 1.0) : g - vec2(1.0, 0.0);
  float phase = atan(abs(r.y), abs(r.x)) / (PI * 0.5);

  float core = smoothstep(0.05, 0.012, d);
  float glow = exp(-d * 10.0);
  float dash = 0.5 + 0.5 * sin(phase * PI * 6.0 - iTime * 3.2);
  dash = smoothstep(0.35, 0.95, dash);

  vec3 col = mix(uColBg, uColDim, 0.35 + 0.3 * glow);
  col = mix(col, uColSignal, glow * 0.55);
  col = mix(col, uColPaper, core * 0.7);
  col += uColAccent * core * dash * 1.5;
  col += uColSignal * glow * dash * 0.5;

  col *= 1.0 - 0.18 * dot(uv, uv);
  fragColor = vec4(col, 1.0);
}
