// Vertical stripes whose phase is dragged sideways by a travelling wave. A
// morph knob slides the profile between a hard square rule and a soft gradient.

float stripeProfile(float phase, float morph) {
  float s = sin(phase);
  float hard = smoothstep(-0.06, 0.06, s);
  float soft = 0.5 + 0.5 * s;
  return mix(hard, soft, morph);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float morph = 0.5 + 0.5 * sin(iTime * 0.45 + uSeed * 6.2831853);

  // Two speeds of bend, so the stripe phase never repeats cleanly.
  float bend = 0.55 * sin(uv.y * 2.3 - iTime * 0.9)
             + 0.22 * sin(uv.y * 5.7 + iTime * 1.35 + uSeed * 3.1);

  float phase = uv.x * 11.0 + bend * 3.4 + iTime * 0.6;
  float band = stripeProfile(phase, morph);

  // Edge energy sits where the stripe flips, so the morph itself reads as light.
  float edge = pow(abs(cos(phase)), 10.0) * (1.0 - morph * 0.5);

  vec3 col = mix(uColBg, uColInk, 0.35);
  col = mix(col, uColSignal, band * 0.8);
  col = mix(col, uColPaper, pow(band, 6.0) * 0.5);
  col += uColAccent * edge * 0.6;

  // A slow highlight sweeps the whole field left to right.
  float sweep = exp(-pow((uv.x - sin(iTime * 0.3) * 1.4) * 1.5, 2.0));
  col += uColAccent * sweep * band * 0.35;

  fragColor = vec4(col, 1.0);
}
