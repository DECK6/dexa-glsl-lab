// A coordinate sheet pinned to four moving control points. Inverse-distance
// displacement pulls the grid locally, so it stretches like rubber between pins.

vec2 pull(vec2 p, vec2 anchor, vec2 offset, float radius) {
  vec2 d = p - anchor;
  float influence = exp(-dot(d, d) / (radius * radius));
  return offset * influence;
}

float gridLine(vec2 p, float scale, float width) {
  vec2 cell = abs(fract(p * scale) - 0.5);
  return smoothstep(0.5 - width, 0.5, max(cell.x, cell.y));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.7 + uSeed;
  vec2 a0 = vec2(-0.58, -0.52);
  vec2 a1 = vec2(0.58, -0.45);
  vec2 a2 = vec2(-0.5, 0.58);
  vec2 a3 = vec2(0.54, 0.52);
  vec2 o0 = vec2(sin(t), cos(t * 1.3)) * 0.2;
  vec2 o1 = vec2(cos(t * 0.8), -sin(t * 1.1)) * 0.24;
  vec2 o2 = vec2(-sin(t * 1.2), cos(t * 0.7)) * 0.18;
  vec2 o3 = vec2(cos(t * 1.4), sin(t * 0.9)) * 0.21;

  vec2 displacement = pull(uv, a0, o0, 0.55) + pull(uv, a1, o1, 0.62)
    + pull(uv, a2, o2, 0.58) + pull(uv, a3, o3, 0.6);
  vec2 warped = uv - displacement;
  float coarse = gridLine(warped, 3.5, 0.06);
  float fine = gridLine(warped, 14.0, 0.13);
  float strain = length(displacement) * 4.2;

  float pins = 0.0;
  pins += exp(-dot(uv - a0, uv - a0) * 110.0);
  pins += exp(-dot(uv - a1, uv - a1) * 110.0);
  pins += exp(-dot(uv - a2, uv - a2) * 110.0);
  pins += exp(-dot(uv - a3, uv - a3) * 110.0);

  vec3 col = mix(uColBg, uColInk, 0.45 + fine * 0.45);
  col = mix(col, uColDim, fine * 0.55);
  col = mix(col, uColSignal, coarse * (0.35 + 0.65 * strain));
  col = mix(col, uColAccent, smoothstep(0.25, 0.9, strain) * coarse * 0.82);
  col = mix(col, uColPaper, clamp(pins, 0.0, 1.0));
  col += uColSignal * pins * strain * 0.35;

  fragColor = vec4(col, 1.0);
}
