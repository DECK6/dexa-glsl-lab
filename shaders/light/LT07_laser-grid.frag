// A rigid laser lattice spans the frame while one horizontal and one vertical
// scanner race through it, detonating bright nodes wherever beams cross.

float laserLine(float coordinate, float density) {
  float d = abs(fract(coordinate * density + 0.5) - 0.5) / density;
  return exp(-d * d * 18000.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float phase = uSeed * 3.1;
  float verticals = laserLine(uv.x + 0.028 * sin(uv.y * 4.0 - iTime), 7.0);
  float horizontals = laserLine(uv.y + 0.024 * sin(uv.x * 5.0 + iTime * 0.8), 7.0);
  float grid = max(verticals, horizontals);

  float scanX = 0.86 * sin(iTime * 0.73 + phase + 0.4);
  float scanY = 0.78 * sin(iTime * 0.91 + phase * 0.7 - 0.6);
  float xBeam = exp(-pow((uv.x - scanX) * 58.0, 2.0));
  float yBeam = exp(-pow((uv.y - scanY) * 58.0, 2.0));
  float xHalo = exp(-abs(uv.x - scanX) * 13.0);
  float yHalo = exp(-abs(uv.y - scanY) * 13.0);
  float node = exp(-length(uv - vec2(scanX, scanY)) * 16.0);
  float pulse = 0.78 + 0.22 * sin(iTime * 4.0 + uSeed);

  vec3 col = mix(uColBg, uColInk, 0.38);
  col += uColSignal * (grid * 0.52 + xHalo * 0.16);
  col += uColAccent * (yBeam * 0.95 + yHalo * 0.12);
  col += uColPaper * (xBeam * 0.78 + grid * (xHalo + yHalo) * 0.55 + node * pulse);
  fragColor = vec4(col, 1.0);
}
