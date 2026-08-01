// One hexagon field, drawn many times at expanding offsets. Offsetting a
// signed distance grows the shape outward, so each pulse stays hexagonal.

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdHexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.8660254, 0.5, 0.5773503);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec2 p = rot(iTime * 0.13) * uv;
  float d = sdHexagon(p, 0.28);

  float pulse = 0.0;
  float lead = 0.0;
  for (int i = 0; i < 4; i++) {
    float ph = fract(iTime * 0.30 + float(i) * 0.25 + uSeed);
    float rad = -0.12 + ph * 1.25;
    float e = abs(d - rad);
    float fade = 1.0 - ph;
    pulse += exp(-e * 30.0) * fade;
    lead += smoothstep(0.010, 0.0, e) * fade;
  }

  // The source hexagon stays lit so the frame never empties between pulses.
  float src = abs(d);
  float srcCore = smoothstep(0.010, 0.0, src);
  float srcGlow = exp(-src * 22.0) * (0.5 + 0.5 * sin(iTime * 2.6));

  vec3 col = uColBg;
  col += uColSignal * pulse * 0.85;
  col += uColAccent * srcGlow * 0.9;
  col = mix(col, uColPaper, clamp(lead * 0.9 + srcCore, 0.0, 1.0));
  col = mix(col, uColBg, smoothstep(0.95, 1.55, length(uv)));

  fragColor = vec4(col, 1.0);
}
