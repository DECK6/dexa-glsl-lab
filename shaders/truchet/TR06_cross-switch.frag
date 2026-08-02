// Orthogonal switch tiles choose a horizontal or vertical route. A changeover
// flash crosses the junction while packets keep moving along the selected rail.

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.29);
  p += dot(p, p + 34.53);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.4;
  vec2 tileId = floor(p);
  vec2 local = fract(p) - 0.5;
  float rnd = hash21(tileId);
  float selector = smoothstep(-0.22, 0.22, sin(iTime * 0.82 + rnd * 6.2831853));
  float changeover = selector * (1.0 - selector) * 4.0;

  float horizontalDistance = abs(local.y);
  float verticalDistance = abs(local.x);
  float routeDistance = mix(horizontalDistance, verticalDistance, selector);
  float rail = smoothstep(0.095, 0.035, routeDistance);
  float halo = exp(-routeDistance * 12.0);
  float along = mix(local.x, local.y, selector);
  float packet = pow(0.5 + 0.5 * sin(along * 18.0 - iTime * 4.8 + rnd * 8.0), 9.0);
  float junction = exp(-dot(local, local) * 60.0);

  vec3 col = mix(uColBg, uColDim, 0.28 + halo * 0.22);
  col = mix(col, uColInk, rail * 0.65);
  col = mix(col, uColSignal, rail * (0.42 + packet * 0.48));
  col += uColAccent * (changeover * junction + packet * rail * 0.55);
  col = mix(col, uColPaper, junction * (0.25 + changeover * 0.58));
  col *= 1.0 - dot(uv, uv) * 0.16;

  fragColor = vec4(col, 1.0);
}
