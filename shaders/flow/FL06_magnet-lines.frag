// An oscillating source-sink dipole exposes its analytic stream function.
// Contour bands become field lines, while pulses travel between the poles.

vec2 fl06DipoleField(vec2 p, vec2 a, vec2 b) {
  vec2 da = p - a;
  vec2 db = p - b;
  return da / max(dot(da, da), 0.012) - db / max(dot(db, db), 0.012);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime * 0.70 + uSeed * 0.43;
  float separation = 0.43 + 0.055 * sin(t * 0.83 + uSeed);
  float tilt = 0.20 * sin(t * 0.47 + uSeed * 1.7);
  vec2 axis = vec2(cos(tilt), sin(tilt));
  vec2 poleA = -axis * separation;
  vec2 poleB = axis * separation;
  vec2 da = uv - poleA;
  vec2 db = uv - poleB;

  float stream = atan(da.y, da.x) - atan(db.y, db.x);
  float potential = log(length(da) + 0.025) - log(length(db) + 0.025);
  vec2 field = fl06DipoleField(uv, poleA, poleB);
  float strength = min(length(field) * 0.12, 1.5);

  float lines = 1.0 - smoothstep(0.055, 0.21, abs(sin(stream * 7.0)));
  float travelers = 1.0 - smoothstep(0.08, 0.28, abs(sin(potential * 8.0 - t * 2.2)));
  float poleGlow = exp(-dot(da, da) * 70.0) + exp(-dot(db, db) * 70.0);
  float envelope = 1.0 - smoothstep(0.72, 1.48, length(uv));

  vec3 col = mix(uColBg, uColInk, 0.16 + strength * 0.16);
  col += uColSignal * lines * envelope * (0.48 + strength * 0.48);
  col += uColAccent * lines * travelers * 0.72;
  col += uColPaper * poleGlow * 0.95;
  col = mix(col, uColDim, poleGlow * 0.20);
  fragColor = vec4(col, 1.0);
}
