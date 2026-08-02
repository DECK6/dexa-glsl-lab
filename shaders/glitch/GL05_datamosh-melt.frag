// Datamosh: the decoder keeps applying motion vectors and never gets a keyframe,
// so macroblocks drag along the flow field and melt until the next reset.

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 frame0(vec2 p) {
  float spokes = step(0.5, fract(atan(p.y, p.x) * 2.4 + 0.5));
  float rings = step(0.5, fract(length(p) * 5.0 - 0.2));
  vec3 col = mix(uColBg, uColInk, 0.8);
  col = mix(col, uColSignal * 0.9, spokes * 0.8);
  col = mix(col, uColAccent, rings * spokes * 0.9);
  col = mix(col, uColPaper, smoothstep(0.22, 0.19, length(p)));
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float cyc = fract(iTime * 0.21 + uSeed * 0.41);
  float melt = cyc * cyc * 1.6;

  vec2 mv = vec2(vnoise(uv * 1.7 + 11.0), vnoise(uv * 1.7 + 41.0)) - 0.5;
  mv.y -= 0.35;

  vec2 p = floor((uv + mv * melt) * 26.0 + 0.5) / 26.0;
  vec3 col = frame0(p);

  // fresh macroblocks punch back in just before the reset, stale ones bleed
  float pop = step(0.93, cyc) * step(0.5, hash21(floor(uv * 26.0) + floor(iTime * 6.0)));
  col = mix(col, uColPaper, pop * 0.7);
  col += uColSignal * melt * 0.14 * vnoise(uv * 8.0 + iTime);
  col *= 1.0 - 0.25 * melt;

  fragColor = vec4(col, 1.0);
}
