// Sinusoidal channels connect opposite tile edges. Orientation is discrete,
// but amplitude breathes continuously so neighbouring channels trade curvature.

float hash21(vec2 p) {
  p = fract(p * vec2(139.47, 201.83) + uSeed * 0.31);
  p += dot(p, p + 33.41);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.6;
  vec2 tileId = floor(p);
  vec2 local = fract(p) - 0.5;
  float rnd = hash21(tileId);
  if (rnd > 0.5) local = local.yx;
  if (fract(rnd * 7.0) > 0.5) local.y = -local.y;

  float amplitude = 0.13 + 0.16 * (0.5 + 0.5 * sin(iTime * 0.74 + rnd * 9.0));
  float centreLine = sin((local.x + 0.5) * 6.2831853) * amplitude;
  float channelDistance = abs(local.y - centreLine);
  float channel = smoothstep(0.09, 0.035, channelDistance);
  float halo = exp(-channelDistance * 11.0);
  float flow = pow(0.5 + 0.5 * sin(local.x * 20.0 - iTime * 5.0 + rnd * 8.0), 8.0);

  vec3 col = mix(uColBg, uColDim, 0.28 + halo * 0.18);
  col = mix(col, uColInk, channel * 0.62);
  col = mix(col, uColSignal, channel * (0.42 + flow * 0.45));
  col += uColAccent * channel * flow * 0.72;
  col = mix(col, uColPaper, channel * flow * 0.3);
  col *= 1.0 - dot(uv, uv) * 0.14;

  fragColor = vec4(col, 1.0);
}
