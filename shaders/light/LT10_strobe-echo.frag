// A hard strobe point launches offset echo rings in rapid succession.
// Broken arcs retain each flash long enough to form a layered radial afterimage.

float echoRing(vec2 p, float radius, float width) {
  return exp(-pow((length(p) - radius) / width, 2.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 origin = vec2(
    0.24 * sin(iTime * 0.39 + uSeed * 2.7),
    0.18 * cos(iTime * 0.47 + uSeed * 1.9)
  );
  vec2 q = uv - origin;
  float cyanEcho = 0.0;
  float orangeEcho = 0.0;
  float hotEcho = 0.0;

  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float age = fract(iTime * 0.42 + fi / 8.0 + uSeed * 0.11);
    float radius = age * 1.58;
    float ring = echoRing(q, radius, 0.018 + age * 0.018);
    float angle = atan(q.y, q.x);
    float broken = smoothstep(-0.35, 0.35, sin(angle * (3.0 + mod(fi, 3.0)) + fi * 1.7));
    float fade = (1.0 - age) * (0.55 + 0.45 * broken);
    cyanEcho += ring * fade * (1.0 - mod(fi, 2.0));
    orangeEcho += ring * fade * mod(fi, 2.0);
    hotEcho += ring * ring * fade;
  }

  float strobe = pow(0.5 + 0.5 * cos(iTime * 8.0 + uSeed * 4.0), 18.0);
  float flash = exp(-length(q) * (9.0 - strobe * 4.0));
  float spokes = pow(abs(cos(atan(q.y, q.x) * 6.0 + iTime * 0.9)), 26.0);
  spokes *= exp(-length(q) * 1.8) * (0.18 + strobe * 0.82);

  vec3 col = mix(uColBg, uColInk, 0.32);
  col += uColSignal * (cyanEcho * 0.82 + spokes * 0.38);
  col += uColAccent * (orangeEcho * 0.75 + flash * 0.30);
  col += uColPaper * (hotEcho * 0.36 + flash * (0.58 + strobe * 0.9));
  fragColor = vec4(col, 1.0);
}
