// Two opposite point vortices bend concentric wavefronts into a
// tense figure-eight field, with their cores breathing out of phase.

vec2 fl02Tangent(vec2 d) {
  return vec2(-d.y, d.x) / max(dot(d, d), 0.025);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.72 + uSeed * 0.53;
  float sway = sin(t * 0.73 + uSeed) * 0.10;
  vec2 poleA = vec2(-0.48, sway);
  vec2 poleB = vec2(0.48, -sway);
  vec2 dA = uv - poleA;
  vec2 dB = uv - poleB;

  vec2 velocity = fl02Tangent(dA) - fl02Tangent(dB);
  vec2 warped = uv - velocity * 0.055;
  float angleA = atan(dA.y, dA.x);
  float angleB = atan(dB.y, dB.x);
  float radial = length(warped * vec2(1.0, 1.16));
  float phase = radial * 22.0 + (angleA - angleB) * 2.2 - t * 2.1;

  float waves = 1.0 - smoothstep(0.08, 0.30, abs(sin(phase)));
  float web = 1.0 - smoothstep(0.035, 0.12, abs(sin((angleA - angleB) * 5.0)));
  float coreA = exp(-dot(dA, dA) * 42.0);
  float coreB = exp(-dot(dB, dB) * 42.0);
  float interaction = exp(-abs(length(dA) - length(dB)) * 12.0);
  float vignette = 1.0 - smoothstep(0.65, 1.55, length(uv));

  vec3 col = mix(uColBg, uColInk, 0.18 + waves * 0.22);
  col += uColSignal * waves * vignette * (0.65 + 0.35 * interaction);
  col += uColDim * web * 0.45;
  col += uColAccent * (coreA + coreB) * (1.1 + 0.2 * sin(t * 3.0));
  col += uColPaper * (coreA * coreB + waves * web) * 0.7;
  fragColor = vec4(col, 1.0);
}
