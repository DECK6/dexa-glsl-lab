// Running bond gone loose: every course slides at its own rate and direction,
// so the bond pattern never settles. A shift pulse climbs the wall.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * vec2(2.6, 4.6);

  float row = floor(p.y);
  float dir = mod(row, 2.0) * 2.0 - 1.0;
  float speed = 0.25 + 0.22 * mod(row, 3.0);
  float slide = iTime * speed * dir + hash21(vec2(row, uSeed)) * 9.0;

  float x = p.x + slide;
  vec2 brick = vec2(floor(x), row);
  vec2 g = vec2(fract(x), fract(p.y)) - 0.5;

  float face = smoothstep(0.0, 0.02, 0.47 - abs(g.x)) * smoothstep(0.0, 0.035, 0.44 - abs(g.y));
  float mortar = smoothstep(0.06, 0.0, 0.5 - max(abs(g.x), abs(g.y) * 0.57));

  // a horizontal pulse walks up the wall and flares whichever course it crosses
  float band = mod(iTime * 1.5, 9.6) - 4.8;
  float pulse = exp(-abs(p.y + 0.5 - band) * 1.6);

  float h = hash21(brick + uSeed);
  float lit = 0.25 + 0.6 * h;

  vec3 stone = mix(uColDim * 0.7, uColSignal, lit * 0.8);
  stone *= 0.45 + 0.55 * lit;
  stone += uColAccent * pulse * (0.5 + 0.7 * h);

  vec3 col = uColBg;
  col = mix(col, uColInk, mortar);
  col = mix(col, stone, face);
  col = mix(col, uColPaper, face * pulse * pulse * 0.3);

  fragColor = vec4(col, 1.0);
}
