// Two gears in mesh. The tooth profile is a polar radius modulation; a half
// turn of phase offset on the right gear puts its valley where the left
// gear's tooth arrives, so the pair actually interlocks at the contact point.

float sdGear(vec2 p, float r, float teeth, float depth, float phase) {
  float a = atan(p.y, p.x + 1e-5);
  float l = length(p);
  float tooth = smoothstep(-0.4, 0.4, cos(a * teeth + phase));
  float body = l - (r + depth * tooth);
  float bore = (r * 0.30) - l;
  return max(body, bore);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float spin = iTime * 0.75 + uSeed * 6.2831853;
  float dA = sdGear(uv - vec2(-0.44, 0.0), 0.36, 12.0, 0.075, spin);
  float dB = sdGear(uv - vec2(0.44, 0.0), 0.36, 12.0, 0.075, -spin + 3.141593);
  float d = min(dA, dB);

  float fill = smoothstep(0.010, -0.010, d);
  float rim = smoothstep(0.012, 0.0, abs(d));
  float glow = exp(-max(d, 0.0) * 26.0);

  // Contact zone between the two hubs flares as teeth pass through it.
  float meshX = exp(-pow(uv.x * 5.0, 2.0)) * exp(-pow(uv.y * 3.0, 2.0));
  float spark = meshX * (0.45 + 0.55 * abs(sin(spin * 6.0)));

  vec3 col = uColBg;
  col += uColSignal * glow * 0.8;
  col = mix(col, uColInk, fill);

  // Radial spokes read the rotation of each gear body.
  float spokesA = smoothstep(0.6, 1.0, cos(atan(uv.y, uv.x + 0.44 + 1e-5) * 6.0 + spin));
  float spokesB = smoothstep(0.6, 1.0, cos(atan(uv.y, uv.x - 0.44 + 1e-5) * 6.0 - spin));
  col += uColSignal * fill * max(spokesA * step(dA, dB), spokesB * step(dB, dA)) * 0.35;

  col += uColAccent * spark * 1.1;
  col = mix(col, uColPaper, rim);

  fragColor = vec4(col, 1.0);
}
