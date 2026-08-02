// A square lattice of glowing wires. Pulses leave a seeded intersection and
// crawl outward hop by hop, brightening every node and wire they reach.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec2 grid = uv * 7.0;

  // Distance to the nearest wire, in cell units.
  vec2 toWire = abs(fract(grid + 0.5) - 0.5);
  float d = min(toWire.x, toWire.y);
  float core = smoothstep(0.085, 0.02, d);
  float bleed = exp(-d * 13.0);

  vec2 node = floor(grid + 0.5);
  float toNode = length(grid - node);
  float nodeDot = smoothstep(0.30, 0.10, toNode);
  float nodeGlow = exp(-toNode * 4.0);

  // Manhattan hops from the origin decide when a node's turn comes.
  vec2 origin = floor(vec2(sin(uSeed * 9.1), cos(uSeed * 5.7)) * 3.0);
  float hops = abs(node.x - origin.x) + abs(node.y - origin.y);

  float lag = hops - fract(iTime * 0.20) * 16.0;
  float pulse = exp(-lag * lag * 0.9);

  // A second, slower front keeps the lattice from ever going quiet.
  float lag2 = hops - fract(iTime * 0.13 + 0.5) * 16.0;
  pulse = max(pulse, exp(-lag2 * lag2 * 0.9) * 0.85);

  vec3 col = mix(uColBg, uColInk, 0.4);
  col += uColDim * bleed * 0.5;
  col += uColSignal * core * (0.45 + 1.2 * pulse);
  col += uColSignal * bleed * pulse * 0.7;
  col += uColAccent * nodeGlow * (0.18 + 1.1 * pulse);
  col = mix(col, uColPaper, nodeDot * (0.2 + 0.7 * pulse * pulse));

  fragColor = vec4(col, 1.0);
}
