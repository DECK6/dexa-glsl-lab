// A grazing view over open water: six directional swells summed onto a
// receding plane, lit so the compressed far field breaks into glitter.

float swell(vec2 p, float t) {
  float h = 0.0;
  float amp = 0.55;
  float freq = 1.1;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 dir = vec2(cos(fi * 2.1 + uSeed), sin(fi * 1.37 + uSeed * 0.6));
    h += amp * sin(dot(p, dir) * freq + t * (0.8 + fi * 0.31));
    amp *= 0.6;
    freq *= 1.8;
  }
  return h;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float horizon = 0.62;
  float depth = max(horizon - uv.y, 0.004);
  float z = 0.6 / depth;
  vec2 p = vec2(uv.x * z, z * 1.4 - iTime * 0.9);

  float h = swell(p, iTime);
  float hx = swell(p + vec2(0.08, 0.0), iTime) - h;
  float hy = swell(p + vec2(0.0, 0.08), iTime) - h;
  vec3 n = normalize(vec3(-hx, 0.5, -hy));

  vec3 lightDir = normalize(vec3(0.35, 0.55, -0.75));
  float diff = max(dot(n, lightDir), 0.0);
  float spec = pow(diff, 26.0);
  float fog = smoothstep(0.0, 0.5, depth);

  vec3 water = mix(uColBg, uColInk, 0.35 + 0.5 * diff);
  water = mix(water, uColSignal, spec * fog * 1.2);
  water = mix(water, uColPaper, pow(spec, 2.0) * fog);
  water = mix(mix(uColBg, uColSignal, 0.16), water, fog);

  vec3 sky = mix(uColBg, uColDim, smoothstep(horizon, 1.0, uv.y));
  sky += uColAccent * exp(-max(uv.y - horizon, 0.0) * 11.0) * 0.3;

  float onWater = smoothstep(horizon + 0.003, horizon - 0.003, uv.y);
  vec3 col = mix(sky, water, onWater);
  col += uColAccent * exp(-abs(uv.y - horizon) * 90.0) * 0.45;

  fragColor = vec4(col, 1.0);
}
