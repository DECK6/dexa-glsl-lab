// A banded pattern sagging column by column: each column drips at its own rate
// and keeps draining downward, so the picture never finishes melting.

float hash11(float x) {
  return fract(sin(x * 127.1 + uSeed * 3.7) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y;

  float cols = 24.0;
  float cx = uv.x * cols;
  float id = floor(cx);
  float rnd = hash11(id);

  // sag deepens toward the bottom of the frame and pulses per column
  float depth = 1.0 - smoothstep(-0.1, 1.0, uv.y);
  float sag = depth * (0.15 + 0.6 * rnd) * (0.6 + 0.4 * sin(iTime * 0.7 + rnd * 6.283));
  float flow = iTime * (0.06 + 0.16 * rnd);

  vec2 w = vec2(uv.x, uv.y + sag + flow);

  float band = abs(fract(w.y * 8.0) - 0.5);
  float stripe = smoothstep(0.24, 0.11, band);
  float thin = smoothstep(0.48, 0.5, abs(fract(w.y * 26.0) - 0.5));
  float seam = smoothstep(0.44, 0.5, abs(fract(cx) - 0.5));

  // drip tip — brightest where a column has sagged furthest
  float tip = smoothstep(0.35, 0.8, sag) * stripe;

  vec3 col = mix(uColBg, uColInk, 0.45 + 0.55 * depth);
  col = mix(col, uColDim * 0.8, thin * 0.5);
  col = mix(col, uColSignal, stripe * (0.4 + 0.5 * (1.0 - depth)));
  col = mix(col, uColAccent, tip * 0.9);
  col = mix(col, uColPaper, stripe * seam * 0.65);

  fragColor = vec4(col, 1.0);
}
