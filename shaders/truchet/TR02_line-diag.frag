// Diagonal Truchet: every tile rocks between "/" and "\" on its own clock,
// so the flip runs through the grid as staggered chatter instead of a beat.

const float PI = 3.14159265;

float hash21(vec2 p) {
  p = fract(p * vec2(211.7, 97.3) + uSeed * 0.311);
  p += dot(p, p + 27.9);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 4.0;

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  float h = hash21(id);
  float ph = fract(iTime * 0.32 + h);
  float flip = smoothstep(0.05, 0.35, ph) - smoothstep(0.55, 0.85, ph);
  float turning = flip * (1.0 - flip) * 4.0;

  float ang = PI * 0.25 + PI * 0.5 * (flip + step(0.5, h));
  vec2 q = rot(-ang) * f;

  float d = abs(q.y);
  float line = smoothstep(0.06, 0.015, d);
  float glow = exp(-d * 13.0);

  // sparks slide along each bar so a settled tile still breathes
  float spark = 0.5 + 0.5 * sin(q.x * 14.0 - iTime * 4.0 + h * 20.0);

  vec3 col = mix(uColBg, uColDim, 0.3);
  col = mix(col, uColInk, glow * 0.6);
  col = mix(col, uColSignal, line * (0.45 + 0.35 * spark));
  col = mix(col, uColPaper, line * spark * 0.5);
  col += uColAccent * turning * (line * 0.9 + glow * 0.5);

  col *= 1.0 - 0.2 * dot(uv, uv);
  fragColor = vec4(col, 1.0);
}
