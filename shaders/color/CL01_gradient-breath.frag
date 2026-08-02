// A four-stop palette ramp sweeps the frame while the whole gradient breathes:
// the sweep axis rotates, the ramp bulges outward, contrast opens and closes.

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(uColBg, uColDim, smoothstep(0.0, 0.34, t));
  c = mix(c, uColSignal, smoothstep(0.26, 0.60, t));
  c = mix(c, uColAccent, smoothstep(0.58, 0.86, t));
  c = mix(c, uColPaper, smoothstep(0.84, 1.0, t));
  return c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float breath = 0.5 + 0.5 * sin(iTime * 0.7 + uSeed * 6.2831);
  float angle = iTime * 0.21 + uSeed * 3.1;
  vec2 axis = vec2(cos(angle), sin(angle));

  float sweep = dot(uv, axis) * 0.62;
  float bulge = length(uv) * mix(0.08, 0.62, breath);
  float t = sweep - bulge + 0.16 * sin(uv.y * 2.4 - iTime * 0.9);

  // ping-pong keeps the ramp cycling forever without a hard wrap seam
  float cyc = abs(fract(t * 0.5 + iTime * 0.08) * 2.0 - 1.0);
  cyc = clamp((cyc - 0.5) * mix(0.85, 1.7, breath) + 0.5, 0.0, 1.0);

  vec3 col = ramp(cyc);

  // the cyan stop blooms softly as the ramp slides past it
  float bloom = exp(-pow((cyc - 0.45) * 5.5, 2.0));
  col += uColSignal * bloom * (0.08 + 0.26 * breath);

  fragColor = vec4(col, 1.0);
}
