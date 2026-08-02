// Herringbone bond. A 2×1 brick's orientation and anchor fall out of
// mod(ix + iy, 4), which is the whole tiling in four cases. A run of light
// travels along the chevrons while the floor drifts diagonally.

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.6 + iTime * 0.3;

  vec2 i = floor(p);
  float k = mod(i.x + i.y, 4.0);

  vec2 centre;
  vec2 half2;
  if (k < 0.5) {
    centre = i + vec2(1.0, 0.5);
    half2 = vec2(1.0, 0.5);
  } else if (k < 1.5) {
    centre = i + vec2(0.0, 0.5);
    half2 = vec2(1.0, 0.5);
  } else if (k < 2.5) {
    centre = i + vec2(0.5, 1.0);
    half2 = vec2(0.5, 1.0);
  } else {
    centre = i + vec2(0.5, 0.0);
    half2 = vec2(0.5, 1.0);
  }

  vec2 q = half2 - abs(p - centre);
  float d = min(q.x, q.y);

  float face = smoothstep(0.0, 0.05, d - 0.05);
  float joint = smoothstep(0.11, 0.0, d);

  float h = hash21(centre + uSeed);
  float run = 0.5 + 0.5 * sin(iTime * 2.4 - dot(centre, vec2(1.0, 1.0)) * 1.5 + h * 1.4);
  run = pow(run, 4.0);

  vec3 brick = mix(uColInk, uColDim, 0.35 + 0.5 * h);
  brick = mix(brick, uColSignal * 0.9, 0.18 + 0.5 * run);
  brick += uColAccent * run * (0.4 + 0.6 * h);

  vec3 col = uColBg;
  col = mix(col, brick, face);
  col = mix(col, uColPaper, joint * face * 0.0 + smoothstep(0.045, 0.0, abs(d - 0.03)) * (0.15 + 0.5 * run));

  fragColor = vec4(col, 1.0);
}
