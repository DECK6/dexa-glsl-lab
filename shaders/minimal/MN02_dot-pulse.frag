// A single signal point beats in place, sending a restrained halo outward.

float heartbeat(float phase) {
  float primary = pow(0.5 + 0.5 * sin(phase), 8.0);
  float echo = pow(0.5 + 0.5 * sin(phase - 1.1), 18.0);
  return clamp(primary + echo * 0.45, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float phase = iTime * 2.2 + uSeed * 1.731;
  float beat = heartbeat(phase);
  vec2 center = vec2(sin(uSeed * 4.7), cos(uSeed * 3.9)) * 0.035;
  float d = length(uv - center);

  float radius = 0.045 + beat * 0.035;
  float core = 1.0 - smoothstep(radius - 0.012, radius + 0.012, d);
  float glow = exp(-d * (4.5 - beat * 1.2)) * (0.24 + beat * 0.28);
  float ringRadius = 0.18 + beat * 0.08;
  float ring = exp(-abs(d - ringRadius) * 34.0) * (0.25 + beat * 0.65);

  vec3 col = mix(uColBg, uColDim, 0.14 + exp(-d * 1.8) * 0.12);
  col = mix(col, uColSignal, glow);
  col += uColAccent * ring * 0.55;
  col = mix(col, uColPaper, core);

  fragColor = vec4(col, 1.0);
}
