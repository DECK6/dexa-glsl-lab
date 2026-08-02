// A horizontal afterburner plume leaves a dark nozzle, alternating expansion
// cells and shock diamonds before turbulence dissolves its narrow tail.

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7) + uSeed * 0.41);
  p += dot(p, p + 34.53);
  return fract(p.x * p.y);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float x = uv.x + 0.78;
  float turbulence = noise21(vec2(x * 4.2 - iTime * 3.4, uv.y * 11.0)) - 0.5;
  float width = (0.1 + x * 0.13) * smoothstep(1.85, -0.05, x);
  float plume = smoothstep(width, width * 0.55, abs(uv.y - turbulence * width * 0.65));
  plume *= smoothstep(-0.02, 0.12, x) * smoothstep(1.85, 1.2, x);
  float diamond = pow(0.5 + 0.5 * cos(x * 11.5 - iTime * 2.0), 10.0);
  diamond *= smoothstep(width, width * 0.08, abs(uv.y)) * plume;
  float sheath = exp(-abs(abs(uv.y) - width) * 35.0) * smoothstep(0.0, 0.12, x) * smoothstep(1.8, 1.1, x);

  float nozzle = smoothstep(0.2, 0.12, abs(uv.y)) * smoothstep(-0.45, -0.78, uv.x);
  float nozzleRim = exp(-abs(uv.x + 0.78) * 42.0) * smoothstep(0.23, 0.13, abs(uv.y));

  vec3 col = mix(uColBg, uColInk, 0.45 + nozzle * 0.5);
  col += uColSignal * plume * (0.32 + diamond * 0.7);
  col += uColAccent * sheath * 0.75;
  col = mix(col, mix(uColSignal, uColPaper, 0.68), diamond);
  col += uColPaper * nozzleRim * 0.6;
  col += uColDim * nozzle * 0.5;

  fragColor = vec4(col, 1.0);
}
