// Ten regular polygons stack in depth. Side count, rotation, and apparent scale
// advance independently, turning a simple outline into a shifting relief map.

float polygonDistance(vec2 p, float sides, float radius, float rotation) {
  float angle = atan(p.y, p.x) + rotation;
  float sector = 6.2831853 / sides;
  float boundary = cos(sector * 0.5) / cos(mod(angle + sector * 0.5, sector) - sector * 0.5);
  return length(p) - radius * boundary;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec3 col = mix(uColBg, uColInk, 0.42);
  float accumulated = 0.0;

  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float sides = 3.0 + mod(fi, 6.0);
    float radius = 0.16 + fi * 0.082 + sin(iTime * 0.65 + fi * 0.77) * 0.025;
    float rotation = iTime * (0.1 + fi * 0.013) * (mod(fi, 2.0) * 2.0 - 1.0) + uSeed * 0.07;
    vec2 centre = vec2(sin(iTime * 0.31 + fi) * 0.035, cos(iTime * 0.27 + fi * 0.8) * 0.035);
    float distanceToEdge = abs(polygonDistance(uv - centre, sides, radius, rotation));
    float outline = exp(-distanceToEdge * 75.0);
    float pulse = 0.5 + 0.5 * sin(iTime * 1.8 - fi * 0.63);
    vec3 tint = mix(uColSignal, uColAccent, fi / 9.0);
    col += tint * outline * (0.18 + pulse * 0.42);
    col = mix(col, uColPaper, outline * pow(pulse, 6.0) * 0.28);
    accumulated += outline;
  }

  col += uColDim * smoothstep(1.2, 3.0, accumulated) * 0.25;
  fragColor = vec4(col, 1.0);
}
