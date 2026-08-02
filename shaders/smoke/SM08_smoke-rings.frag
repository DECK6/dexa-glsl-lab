// Staggered smoke rings leave a pulsing source, widen, wobble, and dissolve.
// Each ring has a different elliptical axis and angular tear pattern.

float hash11(float p) {
  return fract(sin(p * 127.17 + uSeed * 11.3) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float smoke = 0.0;
  float rimLight = 0.0;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float life = fract(iTime * 0.19 + fi * 0.2 + uSeed * 0.053);
    float rnd = hash11(fi + 7.0);
    vec2 centre = vec2((rnd - 0.5) * 0.18, mix(-0.42, 0.32, life));
    float angle = (rnd - 0.5) * 1.2 + iTime * 0.09;
    mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 q = turn * (uv - centre);
    q *= vec2(1.0, 1.45 - life * 0.35);
    float theta = atan(q.y, q.x);
    float radius = length(q);
    float ringRadius = 0.12 + life * 0.72;
    ringRadius += sin(theta * 5.0 + iTime * 0.8 + rnd * 9.0) * life * 0.035;
    float band = exp(-abs(radius - ringRadius) * mix(48.0, 11.0, life));
    float fade = smoothstep(0.0, 0.12, life) * smoothstep(1.0, 0.58, life);
    smoke += band * fade * (0.55 + rnd * 0.45);
    rimLight += band * fade * pow(1.0 - life, 3.0);
  }

  vec3 col = mix(uColBg, uColInk, 0.4 + 0.12 * exp(-length(uv) * 1.6));
  col = mix(col, uColDim, smoothstep(0.04, 0.65, smoke));
  col = mix(col, uColPaper, smoothstep(0.65, 1.45, smoke) * 0.82);
  col += uColSignal * rimLight * 0.48;
  col += uColAccent * exp(-dot(uv - vec2(0.0, -0.45), uv - vec2(0.0, -0.45)) * 55.0) * 0.5;

  fragColor = vec4(col, 1.0);
}
