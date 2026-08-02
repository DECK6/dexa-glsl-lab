// A diagnostic image loses quantization planes tile by tile. Missing bits turn
// smooth ramps into hard terraces while the least significant plane sparkles.

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031 + uSeed * 0.013);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float sourceValue = clamp(0.5 + 0.27 * sin(angle * 4.0 + iTime * 0.8)
    + 0.23 * cos(radius * 11.0 - iTime * 1.3), 0.0, 1.0);

  vec2 tileId = floor((uv + 1.2) * vec2(7.0, 6.0));
  float clock = floor(iTime * 6.0);
  float fault = hash21(tileId + clock * 1.7);
  float levels = fault > 0.78 ? 2.0 : (fault > 0.52 ? 4.0 : 16.0);
  float quantized = floor(sourceValue * levels + 0.5) / levels;
  float dropped = step(0.52, fault);

  vec3 smoothColor = mix(uColBg, uColSignal, sourceValue);
  smoothColor = mix(smoothColor, uColAccent, smoothstep(0.62, 0.9, sourceValue));
  vec3 steppedColor = mix(uColInk, uColPaper, quantized);
  steppedColor = mix(steppedColor, uColAccent, step(0.72, quantized) * 0.72);
  vec3 col = mix(smoothColor, steppedColor, dropped * 0.92);

  vec2 local = abs(fract((uv + 1.2) * vec2(7.0, 6.0)) - 0.5);
  float seam = smoothstep(0.47, 0.5, max(local.x, local.y));
  float bitNoise = step(0.82, hash21(floor(fragCoord / 3.0) + clock));
  col += uColSignal * seam * dropped * 0.42;
  col = mix(col, uColPaper, bitNoise * step(0.88, fault) * 0.75);

  fragColor = vec4(col, 1.0);
}
