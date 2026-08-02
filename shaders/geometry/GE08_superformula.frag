// Gielis superformula parameters drift between flowers, stars, and rounded
// squares. Three phase-offset contours make the morph legible at every instant.

float superRadius(float angle, float m, float n1, float n2, float n3) {
  float a = pow(abs(cos(m * angle * 0.25)), n2);
  float b = pow(abs(sin(m * angle * 0.25)), n3);
  return pow(max(a + b, 0.0001), -1.0 / n1);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float angle = atan(uv.y, uv.x) + iTime * 0.12;
  float radius = length(uv);
  float morph = 0.5 + 0.5 * sin(iTime * 0.48 + uSeed);
  float m = mix(4.0, 9.0, morph);
  float n1 = mix(0.45, 2.8, 0.5 + 0.5 * sin(iTime * 0.37));
  float n2 = mix(0.7, 4.0, morph);
  float n3 = mix(4.0, 0.7, morph);
  float shapeRadius = superRadius(angle, m, n1, n2, n3);
  shapeRadius = 0.55 * clamp(shapeRadius, 0.52, 1.48);

  float contourA = exp(-abs(radius - shapeRadius) * 72.0);
  float contourB = exp(-abs(radius - shapeRadius * 0.72) * 65.0);
  float contourC = exp(-abs(radius - shapeRadius * 0.44) * 58.0);
  float interior = smoothstep(shapeRadius, shapeRadius - 0.12, radius);

  vec3 col = mix(uColBg, uColInk, 0.4 + interior * 0.35);
  col += uColSignal * contourA * 0.9;
  col += uColAccent * contourB * 0.78;
  col += uColDim * contourC * 0.62;
  col = mix(col, uColPaper, clamp(contourA * contourB * 1.8 + contourC * 0.28, 0.0, 1.0));

  fragColor = vec4(col, 1.0);
}
