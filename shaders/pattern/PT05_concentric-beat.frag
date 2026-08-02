// Concentric rings on a two-part beat: a fast kick that punches a shock ring
// out of the centre, and a slow swell that widens the whole set.

float beat(float t) {
  float phase = fract(t);
  return exp(-phase * 5.0) * (1.0 - phase * 0.2);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float r = length(uv);

  float kick = beat(iTime * 0.75 + uSeed);
  float swell = 0.5 + 0.5 * sin(iTime * 0.33);

  // Rings march outward; the kick momentarily compresses their spacing.
  float freq = mix(9.0, 15.0, swell) - kick * 3.5;
  float ring = abs(sin(r * freq - iTime * 2.2));

  float line = smoothstep(0.55, 0.98, ring);
  float core = smoothstep(0.90, 1.0, ring);

  // Radial falloff keeps the centre the loudest part of the beat.
  float energy = exp(-r * 1.1) * (0.55 + 0.75 * kick);

  vec3 tint = mix(uColSignal, uColAccent, 0.5 + 0.5 * sin(r * 3.0 - iTime * 0.8));

  vec3 col = mix(uColBg, uColInk, 0.22);
  col += tint * line * energy * 1.5;
  col = mix(col, uColPaper, core * energy * 0.8);

  // One shock ring races out on every kick.
  float shockR = fract(iTime * 0.75 + uSeed) * 1.7;
  col += uColAccent * exp(-pow((r - shockR) * 9.0, 2.0)) * 0.9;

  fragColor = vec4(col, 1.0);
}
