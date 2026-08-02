// Voronoi paving: the stones creep on their sites so the joints keep re-cutting
// themselves, and a slow sweep lights one stone after another.

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv * 3.2;
  vec2 ip = floor(p);
  vec2 fp = fract(p);

  float first = 8.0;
  float second = 8.0;
  vec2 owner = vec2(0.0);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(ip + o + uSeed);
      vec2 site = o + 0.5 + 0.4 * sin(iTime * 0.6 + 6.2831853 * h);
      float d = length(site - fp);
      if (d < first) {
        second = first;
        first = d;
        owner = ip + o + h;
      } else if (d < second) {
        second = d;
      }
    }
  }

  float seam = second - first;
  float h = fract(sin(dot(owner, vec2(12.9898, 78.233))) * 43758.545);
  float sweep = 0.5 + 0.5 * sin(iTime * 1.2 - dot(owner, vec2(0.9, 0.55)) + h * 6.2831853);
  sweep *= sweep;

  vec3 stone = mix(uColInk, uColDim, 0.3 + 0.5 * h);
  stone = mix(stone, uColSignal * 0.85, 0.12 + 0.55 * sweep);

  vec3 col = mix(stone, uColBg, smoothstep(0.16, 0.0, seam) * 0.9);
  col += uColAccent * smoothstep(0.07, 0.0, seam) * (0.3 + 0.8 * sweep);
  col = mix(col, uColPaper, smoothstep(0.025, 0.0, seam) * 0.45);

  fragColor = vec4(col, 1.0);
}
