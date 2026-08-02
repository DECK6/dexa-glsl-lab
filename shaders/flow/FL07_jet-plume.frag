// A narrow nozzle drives a noisy vertical jet that widens, entrains
// alternating eddies, and breaks into hot filaments as it climbs.

float fl07Hash(vec2 p) {
  p = fract(p * vec2(234.34, 735.13) + uSeed * 0.191);
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float fl07Noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(fl07Hash(i), fl07Hash(i + vec2(1.0, 0.0)), u.x),
    mix(fl07Hash(i + vec2(0.0, 1.0)), fl07Hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fl07Fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 5; i++) {
    sum += fl07Noise(p) * amp;
    p = mat2(1.72, -1.08, 1.08, 1.72) * p + vec2(5.2, 3.7);
    amp *= 0.50;
  }
  return sum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.72 + uSeed * 0.33;
  float height = clamp((uv.y + 0.92) / 1.92, 0.0, 1.0);
  float width = 0.09 + height * 0.43;
  vec2 noiseUv = vec2(uv.x * 4.2, uv.y * 3.1 - t * 0.72);
  float coarse = fl07Fbm(noiseUv * 0.62 + vec2(uSeed * 0.13, 0.0));
  float fine = fl07Fbm(noiseUv * 1.85 + coarse * 1.7);
  float axis = sin(uv.y * 4.0 - t) * 0.045 + (coarse - 0.5) * width * 0.52;
  float plume = 1.0 - smoothstep(width * 0.42, width, abs(uv.x - axis));
  float filament = smoothstep(0.34, 0.70, fine + coarse * 0.34);

  float eddies = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float parity = mod(fi, 2.0) * 2.0 - 1.0;
    float rise = mod(t * (0.18 + fi * 0.012) + fl07Hash(vec2(fi, 4.0)) * 1.8, 1.8) - 0.82;
    vec2 center = vec2(parity * (0.13 + 0.10 * (rise + 0.82)), rise);
    vec2 d = uv - center;
    eddies += exp(-dot(d, d) * (24.0 - fi * 1.7));
  }

  float nozzleX = 1.0 - smoothstep(0.075, 0.115, abs(uv.x));
  float nozzleY = 1.0 - smoothstep(0.045, 0.095, abs(uv.y + 0.94));
  float nozzle = nozzleX * nozzleY;
  vec3 col = mix(uColBg, uColInk, 0.12 + coarse * 0.18);
  col += uColSignal * plume * (0.32 + filament * 0.88);
  col += uColAccent * plume * eddies * 0.42;
  col += uColPaper * (nozzle + plume * filament * (1.0 - height) * 0.40);
  fragColor = vec4(col, 1.0);
}
