// A hex field where a travelling height wave inflates each cell in turn. The
// rims stay lit so the lattice reads even where the wave has passed.

const vec2 HEX = vec2(1.0, 1.7320508);

// xy = offset inside the cell, zw = cell centre
vec4 hexCell(vec2 p) {
  vec2 a = mod(p, HEX) - HEX * 0.5;
  vec2 b = mod(p - HEX * 0.5, HEX) - HEX * 0.5;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return vec4(g, p - g);
}

float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, normalize(HEX)), p.x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.4;

  vec4 cell = hexCell(p);
  vec2 id = cell.zw;

  // one crest rolling across the field, each cell phased by its own centre
  float phase = dot(id, vec2(0.95, 0.6)) - iTime * 1.8 + uSeed;
  float wave = 0.5 + 0.5 * sin(phase);
  float lift = wave * wave;

  float d = hexDist(cell.xy);
  float radius = mix(0.13, 0.45, lift);
  float body = smoothstep(radius, radius - 0.07, d);
  float rim = smoothstep(0.045, 0.0, abs(d - 0.46));
  float floorPlate = smoothstep(0.48, 0.44, d);

  vec3 col = uColBg;
  col = mix(col, uColInk, floorPlate);
  col = mix(col, uColDim * 0.9, rim * 0.8);
  col = mix(col, uColSignal * (0.4 + 0.6 * lift), body);
  col += uColAccent * pow(lift, 5.0) * (body * 0.8 + rim * 0.5);
  col += uColPaper * body * pow(lift, 12.0) * 0.5;

  fragColor = vec4(col, 1.0);
}
