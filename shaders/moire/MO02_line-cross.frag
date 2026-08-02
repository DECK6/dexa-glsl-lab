// Two line bundles crossing at a couple of degrees. The crossing angle
// breathes, so the beat bands swing between wide slabs and a tight ladder
// while the whole rig leans over slowly.

float bundlePhase(vec2 p, float angle, float k) {
  return dot(p, vec2(cos(angle), sin(angle))) * k;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float lean = iTime * 0.05 + uSeed;
  float tilt = 0.030 + 0.026 * sin(iTime * 0.24);
  float k = 152.0;

  float pa = bundlePhase(uv, lean + tilt, k) + iTime * 2.0;
  float pb = bundlePhase(uv, lean - tilt, k * 1.012) - iTime * 2.0;

  float la = smoothstep(0.30, 0.95, sin(pa));
  float lb = smoothstep(0.30, 0.95, sin(pb));
  float band = smoothstep(-0.2, 0.9, cos(pa - pb));
  float any = max(la, lb);

  vec3 col = mix(uColBg, uColInk, 0.7);
  col = mix(col, uColDim, any * 0.55);
  col = mix(col, uColSignal, any * band * 0.6);
  col = mix(col, uColPaper, la * lb);
  col += uColAccent * pow(band, 5.0) * (0.22 + 0.5 * any);

  fragColor = vec4(col, 1.0);
}
