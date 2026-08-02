// A luminous metronome arm keeps time above a dim mechanical arc.

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  vec2 pivot = vec2(0.0, -0.72);
  float swing = sin(iTime * 0.92 + uSeed * 2.131) * 0.58;
  vec2 tip = pivot + vec2(sin(swing), cos(swing)) * 1.08;

  float barDistance = segmentDistance(uv, pivot, tip);
  float barCore = 1.0 - smoothstep(0.008, 0.025, barDistance);
  float barGlow = exp(-barDistance * 14.0);
  float pivotDistance = length(uv - pivot);
  float weightDistance = length(uv - tip);
  float pivotCore = 1.0 - smoothstep(0.085, 0.13, pivotDistance);
  float weightCore = 1.0 - smoothstep(0.055, 0.11, weightDistance);
  float arc = exp(-abs(pivotDistance - 1.08) * 55.0)
    * smoothstep(pivot.y, pivot.y + 0.35, uv.y);

  vec3 col = mix(uColBg, uColDim, 0.12 + exp(-pivotDistance * 1.6) * 0.14);
  col += uColSignal * (barGlow * 0.43 + arc * 0.18);
  col += uColAccent * (weightCore * 0.8 + arc * 0.16);
  col = mix(col, uColPaper, max(barCore, pivotCore));

  fragColor = vec4(col, 1.0);
}
