// A blunt moving body sheds an alternating row of vortices downstream.
// Their signed angles bend fine wake lines into a von Karman street.

float fl09Hash(float p) {
  return fract(sin(p * 113.5 + uSeed * 47.3) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.73 + uSeed * 0.39;
  vec2 bodyCenter = vec2(-0.62, sin(t * 0.63) * 0.045);
  float signedWarp = 0.0;
  float eddies = 0.0;
  float hotCores = 0.0;

  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float parity = mod(fi, 2.0) * 2.0 - 1.0;
    float travel = mod(fi * 0.193 + t * 0.135 + fl09Hash(fi) * 0.05, 1.78);
    vec2 center = vec2(-0.40 + travel, bodyCenter.y + parity * (0.11 + 0.035 * sin(t + fi)));
    vec2 d = uv - center;
    float influence = exp(-dot(d, d) * 2.8);
    signedWarp += parity * atan(d.y, d.x) * influence;
    eddies += exp(-dot(d, d) * 72.0);
    hotCores += exp(-dot(d, d) * 310.0);
  }

  float behind = smoothstep(-0.48, -0.20, uv.x);
  float wakeWidth = 1.0 - smoothstep(0.28, 0.78, abs(uv.y - bodyCenter.y));
  float wakePhase = (uv.y - bodyCenter.y) * 26.0 + signedWarp * 2.4 - t * 1.1;
  float wakeLines = 1.0 - smoothstep(0.07, 0.25, abs(sin(wakePhase)));
  float bodyDistance = length(uv - bodyCenter);
  float body = 1.0 - smoothstep(0.175, 0.195, bodyDistance);
  float rim = 1.0 - smoothstep(0.008, 0.030, abs(bodyDistance - 0.185));
  float bow = exp(-abs(uv.x - bodyCenter.x + 0.22) * 30.0) * exp(-pow((uv.y - bodyCenter.y) * 3.5, 2.0));

  vec3 col = mix(uColBg, uColInk, wakeWidth * behind * 0.28);
  col += uColSignal * wakeLines * wakeWidth * behind * 0.72;
  col += uColAccent * eddies * behind * 0.62;
  col = mix(col, uColBg, body * 0.94);
  col += uColPaper * (rim + hotCores * 0.38);
  col += uColSignal * bow * (1.0 - body) * 0.55;
  fragColor = vec4(col, 1.0);
}
