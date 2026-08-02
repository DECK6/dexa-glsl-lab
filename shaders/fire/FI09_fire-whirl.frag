// A fire whirl viewed down its spinning throat. Logarithmic ribbons tighten
// toward the eye while detached flame beads orbit on a second angular clock.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float radius = length(uv) + 0.001;
  float angle = atan(uv.y, uv.x);
  float spiralPhase = angle * 5.0 + log(radius) * 12.0 - iTime * 5.4 + uSeed;
  float ribbon = pow(0.5 + 0.5 * sin(spiralPhase), 7.0);
  float ribbonTwo = pow(0.5 + 0.5 * sin(spiralPhase * 0.62 + iTime * 2.1), 10.0);
  float envelope = smoothstep(1.35, 0.08, radius) * smoothstep(0.03, 0.22, radius);
  float flame = (ribbon + ribbonTwo * 0.65) * envelope;

  float beadAngle = fract((angle + 3.1415927) / 6.2831853 * 11.0 - iTime * 0.9);
  float beadRadius = 0.34 + 0.18 * sin(angle * 3.0 + iTime * 1.7);
  float beads = exp(-abs(radius - beadRadius) * 34.0)
    * exp(-abs(beadAngle - 0.5) * 24.0);
  float eye = exp(-radius * radius * 38.0);

  vec3 col = mix(uColBg, uColInk, smoothstep(1.3, 0.0, radius) * 0.75);
  col += uColAccent * flame * 1.15;
  col = mix(col, mix(uColAccent, uColPaper, 0.7), clamp(ribbon * envelope * 1.1, 0.0, 1.0));
  col += uColPaper * beads * 0.9;
  col += uColSignal * (eye * 0.75 + envelope * (1.0 - ribbon) * 0.08);
  col = mix(col, uColBg, eye * 0.72);

  fragColor = vec4(col, 1.0);
}
