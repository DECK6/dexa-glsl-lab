// Six orbiting emitters, each carrying one palette color, summed additively.
// Where the halos overlap the mixture climbs off the ramp into paper-white.

vec3 lamp(vec2 uv, vec2 pos, vec3 tint, float power) {
  float d = length(uv - pos);
  float g = exp(-d * 2.6) * 0.55 + 0.05 / (d * d + 0.02);
  return tint * power * g;
}

vec2 orbit(float radius, float speed, float phase) {
  float a = iTime * speed + phase + uSeed * 6.2831;
  return vec2(cos(a), sin(a * 1.3)) * radius;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec3 col = uColBg;
  col += lamp(uv, orbit(0.62, 0.51, 0.0), uColSignal, 0.40);
  col += lamp(uv, orbit(0.80, -0.37, 2.1), uColAccent, 0.44);
  col += lamp(uv, orbit(0.45, 0.83, 4.0), uColPaper, 0.22);
  col += lamp(uv, orbit(0.92, 0.29, 1.2), uColSignal, 0.30);
  col += lamp(uv, orbit(0.55, -0.66, 3.3), uColAccent, 0.28);
  col += lamp(uv, orbit(0.34, 1.10, 5.4), uColDim, 0.36);

  // overlap saturates toward paper, and the whole field breathes
  float lum = (col.r + col.g + col.b) / 3.0;
  col += uColPaper * smoothstep(0.75, 1.8, lum) * 0.7;
  col *= 0.84 + 0.20 * sin(iTime * 0.6);

  fragColor = vec4(col, 1.0);
}
