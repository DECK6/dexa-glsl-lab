// Cracks running through stone: a Voronoi fracture network lit from behind,
// with a shock front sweeping outward that heats every seam it crosses.

vec2 hash22(vec2 p) {
  p += fract(uSeed * 0.0000129) * 51.4;
  p = vec2(dot(p, vec2(311.7, 127.1)), dot(p, vec2(183.3, 269.5)));
  return fract(sin(p) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 6.0;
  uv += 0.35 * vec2(sin(uv.y * 0.7 + iTime * 0.1), cos(uv.x * 0.6 - iTime * 0.08));

  vec2 base = floor(uv);
  vec2 f = fract(uv);
  float d1 = 8.0;
  float d2 = 8.0;
  vec2 id = base;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 p = g + hash22(base + g);
      float d = length(p - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = base + g;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  float crack = smoothstep(0.055, 0.004, d2 - d1);
  float grain = hash22(id).y;

  vec2 epicentre = 1.6 * vec2(sin(iTime * 0.23), cos(iTime * 0.17));
  float r = length(uv - epicentre);
  float front = fract(iTime * 0.16) * 9.0;
  float swept = 0.32 + 0.68 * smoothstep(front, front - 1.4, r);
  float heat = smoothstep(1.1, 0.0, abs(r - front));

  vec3 col = mix(uColBg, uColInk, 0.45 + 0.55 * grain);
  col = mix(col, uColDim * 0.35, smoothstep(0.5, 0.05, d1) * grain);
  col = mix(col, uColSignal * 0.55, crack * swept);
  col += uColAccent * crack * swept * heat * 1.6;
  col += uColPaper * crack * swept * heat * 0.25;

  fragColor = vec4(col, 1.0);
}
