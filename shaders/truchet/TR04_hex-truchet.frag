// Hexagonal Truchet: three corner arcs per hex knot into a net, and each
// hex twists a sixth of a turn on its own beat, re-lacing the mesh.

const float PI = 3.14159265;
const float R = 0.2886751;
const vec2 C0 = vec2(0.0, 0.5773503);
const vec2 C1 = vec2(-0.5, -0.2886751);
const vec2 C2 = vec2(0.5, -0.2886751);

float hash21(vec2 p) {
  p = fract(p * vec2(311.7, 127.1) + uSeed * 0.257);
  p += dot(p, p + 39.3);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

// local hex coords in .xy, an integral cell id in .zw
vec4 hexCell(vec2 p) {
  vec2 s = vec2(1.0, 1.7320508);
  vec2 ia = floor(p / s);
  vec2 a = p - (ia + 0.5) * s;
  vec2 ib = floor((p - s * 0.5) / s);
  vec2 b = p - s * 0.5 - (ib + 0.5) * s;
  return dot(a, a) < dot(b, b) ? vec4(a, ia) : vec4(b, ib + vec2(97.0, 41.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec4 hc = hexCell(uv * 3.0 + vec2(iTime * 0.06, iTime * 0.1));

  float h = hash21(hc.zw);
  float twist = smoothstep(-0.5, 0.5, sin(iTime * 0.7 + h * 6.2832));
  vec2 q = rot(PI / 3.0 * twist) * hc.xy;

  float d = abs(length(q - C0) - R);
  d = min(d, abs(length(q - C1) - R));
  d = min(d, abs(length(q - C2) - R));

  float net = smoothstep(0.045, 0.012, d);
  float glow = exp(-d * 14.0);
  float flow = 0.5 + 0.5 * sin(atan(q.y, q.x) * 3.0 - iTime * 2.5 + h * 6.2832);
  float mid = twist * (1.0 - twist) * 4.0;

  vec3 col = mix(uColBg, uColDim, 0.3);
  col = mix(col, uColSignal, glow * 0.5);
  col = mix(col, uColPaper, net * (0.5 + 0.4 * flow));
  col += uColAccent * mid * (net * 1.1 + glow * 0.5);
  col += uColSignal * glow * flow * 0.35;

  col *= 1.0 - 0.2 * dot(uv, uv);
  fragColor = vec4(col, 1.0);
}
