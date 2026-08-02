// A metronomic drip: the bead falls, hits the pool, and every impact leaves
// a ring still opening while the next drop is already on its way down.

float hash11(float n) {
  return fract(sin(n * 41.37 + uSeed * 7.13) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float pool = -0.3;
  float rate = 0.85;
  float beat = iTime * rate;
  float n = floor(beat);
  float f = fract(beat);

  vec3 col = mix(uColBg, uColInk, 0.22 + 0.2 * smoothstep(0.6, -1.0, uv.y));

  // rings left by the last four impacts, flattened by the viewing angle
  float rings = 0.0;
  for (int k = 0; k < 4; k++) {
    float age = (f + float(k)) / rate;
    float impactX = (hash11(n - float(k)) * 2.0 - 1.0) * 0.45;
    float d = length((uv - vec2(impactX, pool)) * vec2(1.0, 2.6));
    float r = age * 0.55;
    float decay = exp(-age * 1.1);
    rings += smoothstep(0.055, 0.0, abs(d - r)) * decay;
    rings += smoothstep(0.03, 0.0, abs(d - r * 0.55)) * decay * 0.5;
  }

  // the bead currently in flight, accelerating downward
  float dropX = (hash11(n + 1.0) * 2.0 - 1.0) * 0.45;
  float dropY = mix(1.05, pool, f * f);
  float bead = smoothstep(0.036, 0.008, length((uv - vec2(dropX, dropY)) * vec2(1.0, 0.62)));
  float tail = smoothstep(0.018, 0.0, abs(uv.x - dropX))
             * exp(-(uv.y - dropY) * 12.0) * step(dropY, uv.y) * 0.45;

  float splash = exp(-f * 9.0)
               * smoothstep(0.16, 0.0, length((uv - vec2(dropX, pool)) * vec2(1.0, 0.7)));

  col = mix(col, uColSignal, clamp(rings, 0.0, 1.0) * 0.9);
  col = mix(col, uColPaper, smoothstep(0.75, 1.3, rings));
  col += uColSignal * tail;
  col = mix(col, uColPaper, bead);
  col += uColAccent * splash * 0.9;
  col += uColAccent * exp(-abs(uv.y - pool) * 26.0) * 0.14;

  fragColor = vec4(col, 1.0);
}
