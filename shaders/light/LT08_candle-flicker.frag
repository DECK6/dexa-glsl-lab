// One candle flame bends and pinches under irregular temporal noise.
// A warm halo fills the room while tiny embers detach from the wick.

float candleHash(float n) {
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);
}

float candleNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(candleHash(i), candleHash(i + 1.0), f);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float flicker = candleNoise(iTime * 7.0) * 0.65 + candleNoise(iTime * 13.0 + 9.0) * 0.35;
  float bend = (flicker - 0.5) * 0.20 + 0.035 * sin(iTime * 4.7 + uSeed);
  vec2 flamePoint = uv - vec2(bend * (uv.y + 0.52), -0.16);

  float taper = mix(0.22, 0.018, smoothstep(-0.52, 0.55, flamePoint.y));
  float flameShape = abs(flamePoint.x) / taper + abs(flamePoint.y + 0.05) * 1.35;
  float flame = smoothstep(1.02, 0.72, flameShape) * smoothstep(-0.58, -0.40, flamePoint.y);
  float coreShape = abs(flamePoint.x + bend * 0.25) / (taper * 0.42)
                  + abs(flamePoint.y + 0.30) * 2.6;
  float core = smoothstep(1.0, 0.58, coreShape) * flame;

  float halo = exp(-length((uv - vec2(0.0, -0.12)) / vec2(0.82, 1.0)) * (1.65 + flicker * 0.35));
  float candle = smoothstep(0.31, 0.28, abs(uv.x)) * smoothstep(-1.05, -0.93, uv.y);
  candle *= smoothstep(-0.46, -0.52, uv.y);
  float wick = smoothstep(0.025, 0.008, abs(uv.x)) * smoothstep(-0.54, -0.50, uv.y);
  wick *= smoothstep(-0.30, -0.34, uv.y);
  float embers = pow(max(sin((uv.y - iTime * 0.18) * 44.0 + uSeed * 7.0)
                   * sin(uv.x * 61.0 - iTime * 0.7), 0.0), 28.0);
  embers *= smoothstep(0.12, 0.58, uv.y) * exp(-abs(uv.x) * 2.8);

  vec3 col = mix(uColBg, uColInk, 0.24);
  col += uColAccent * (halo * (0.23 + flicker * 0.12) + flame * 0.94 + embers * 0.7);
  col = mix(col, uColPaper, core * 0.88);
  col = mix(col, mix(uColPaper, uColDim, 0.35), candle * 0.72);
  col = mix(col, uColBg, wick * 0.78);
  fragColor = vec4(col, 1.0);
}
