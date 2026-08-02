// Tile cache corruption: whole tiles get served from the wrong address, filled
// with static, or inverted — each blinking on its own hashed clock.

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec3 scene(vec2 p) {
  float r = length(p);
  float dots = smoothstep(0.17, 0.11, length(fract(p * 3.0) - 0.5));
  float sweep = 0.5 + 0.5 * sin(atan(p.y, p.x) * 3.0 + iTime * 0.7);
  vec3 col = mix(uColBg, uColInk, smoothstep(1.2, 0.0, r));
  col = mix(col, uColSignal * (0.4 + 0.6 * sweep), dots * 0.9);
  col = mix(col, uColAccent, smoothstep(0.30, 0.26, r) * 0.9);
  col = mix(col, uColPaper, smoothstep(0.09, 0.06, r));
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float tiles = 9.0;
  vec2 tid = floor(uv * tiles);
  float clock = mod(floor(iTime * 5.0 + hash21(tid + uSeed) * 6.0), 2048.0);
  float roll = hash21(tid * 1.7 + clock * 2.3 + uSeed * 13.0);

  // bad address: this tile reads another tile's pixels
  vec2 jump = (vec2(hash21(tid + clock), hash21(tid.yx - clock)) - 0.5) * 2.2;
  vec3 col = scene(mix(uv, uv + jump, step(0.72, roll)));

  float noise = hash21(floor(fragCoord / 3.0) + clock * 7.0 + uSeed);
  col = mix(col, mix(uColBg, uColPaper, noise), step(0.90, roll) * 0.9);
  col = mix(col, clamp(uColPaper - col, 0.0, 1.0), step(0.60, roll) * step(roll, 0.72) * 0.85);

  vec2 f = abs(fract(uv * tiles) - 0.5);
  col += uColAccent * step(0.44, max(f.x, f.y)) * step(0.60, roll) * 0.55;

  fragColor = vec4(col, 1.0);
}
