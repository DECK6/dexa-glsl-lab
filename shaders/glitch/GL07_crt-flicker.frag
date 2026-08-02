// CRT surface: barrel-warped glass, phosphor triads, interlace, a mains hum bar
// drifting up the tube and a fast flicker riding the whole gain stage.

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

vec3 broadcast(vec2 p) {
  float wave = sin(p.x * 5.0 + iTime * 1.6) * 0.22 + sin(p.x * 11.0 - iTime * 2.3) * 0.09;
  float line = smoothstep(0.07, 0.0, abs(p.y - wave));
  float grid = clamp(step(0.9, fract(p.x * 6.0)) + step(0.9, fract(p.y * 6.0)), 0.0, 1.0);
  float disc = smoothstep(0.34, 0.30, length(p - vec2(0.0, 0.45)));
  vec3 col = mix(uColBg, uColInk, 0.8);
  col = mix(col, uColDim * 0.9, grid * 0.6);
  col += uColSignal * line * 1.2;
  col = mix(col, uColAccent, disc * 0.9);
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec2 p = uv * (1.0 + 0.13 * dot(uv, uv));
  float inside = step(max(abs(p.x), abs(p.y)), 1.0);
  vec3 col = broadcast(p) * 1.2 * inside;

  // phosphor triads across x, interlaced field across y
  float tri = fract(fragCoord.x / 3.0);
  vec3 mask = uColSignal * step(tri, 0.34)
            + uColAccent * step(0.34, tri) * step(tri, 0.67)
            + uColPaper * step(0.67, tri);
  col = mix(col, col * mask * 2.4, 0.45);
  col *= 0.58 + 0.42 * step(0.5, fract(fragCoord.y * 0.5 + float(iFrame) * 0.5));

  float bar = exp(-abs(fract(p.y * 0.5 + 0.5 - iTime * 0.11) - 0.5) * 7.0);
  col += uColPaper * bar * 0.16 * inside;
  col *= 0.88 + 0.12 * hash11(mod(floor(iTime * 30.0), 2048.0) + uSeed);
  col *= 1.0 - 0.55 * smoothstep(0.6, 1.45, length(uv));
  col += uColBg * (1.0 - inside);

  fragColor = vec4(col, 1.0);
}
