// Looking up from below. The wavy ceiling scatters the light into shafts
// that sweep with the swell while bubbles climb toward it.

float hash11(float n) {
  return fract(sin(n * 78.233 + uSeed * 19.7) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float surf = 0.72
             + 0.05 * sin(uv.x * 4.0 + iTime * 1.1)
             + 0.03 * sin(uv.x * 9.3 - iTime * 1.7);
  float below = smoothstep(surf + 0.01, surf - 0.01, uv.y);

  vec2 sun = vec2(0.35 * sin(iTime * 0.2 + uSeed), surf + 0.12);
  vec2 v = uv - sun;
  float ang = atan(v.x, -v.y);
  float dist = length(v);

  float shafts = 0.0;
  float amp = 0.6;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    shafts += amp * sin(ang * (11.0 + fi * 7.0) + iTime * (0.5 + fi * 0.4) + fi * 2.3);
    amp *= 0.6;
  }
  shafts = smoothstep(0.1, 0.9, shafts * 0.5 + 0.5);
  float beam = shafts * exp(-dist * 1.05) * below;

  float bubbles = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float x = (hash11(fi) * 2.0 - 1.0) * 0.95;
    float rise = 0.18 + hash11(fi + 3.0) * 0.24;
    float y = mod(iTime * rise + hash11(fi + 9.0) * 2.0, 2.1) - 1.05;
    x += 0.05 * sin(y * 6.0 + fi);
    float r = 0.011 + 0.013 * hash11(fi + 17.0);
    bubbles += smoothstep(r, r * 0.3, length(uv - vec2(x, y)));
  }

  vec3 col = mix(uColBg, uColInk, 0.2 + 0.35 * smoothstep(-1.0, 1.0, uv.y));
  col += uColSignal * beam * 1.15;
  col += uColPaper * pow(beam, 3.0) * 0.9;

  // the underside of the surface itself
  float skin = exp(-abs(uv.y - surf) * 24.0);
  col = mix(col, uColSignal, skin * 0.5);
  col += uColAccent * smoothstep(surf - 0.004, surf + 0.04, uv.y) * 0.22;
  col += uColPaper * bubbles * below * 0.75;

  fragColor = vec4(col, 1.0);
}
