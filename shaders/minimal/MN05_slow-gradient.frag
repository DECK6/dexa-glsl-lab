// A broad two-tone field rotates almost imperceptibly around a pale seam.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float angle = iTime * 0.105 + uSeed * 1.371;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec2 normal = vec2(-direction.y, direction.x);

  float gradient = clamp(0.5 + dot(uv, direction) * 0.38, 0.0, 1.0);
  float drift = sin(iTime * 0.17 + uSeed * 4.0) * 0.16;
  float seamDistance = abs(dot(uv, normal) - drift);
  float seam = exp(-seamDistance * 18.0);
  float cyanField = exp(-length(uv - direction * 0.72) * 1.35);
  float amberField = exp(-length(uv + direction * 0.78) * 1.45);

  vec3 col = mix(uColBg, uColDim, 0.2 + gradient * 0.22);
  col = mix(col, uColSignal, cyanField * 0.31);
  col = mix(col, uColAccent, amberField * 0.24);
  col = mix(col, uColPaper, seam * 0.32);

  fragColor = vec4(col, 1.0);
}
