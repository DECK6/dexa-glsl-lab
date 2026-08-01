// A flower built from polar radius functions: two rose curves counter-rotating
// around a pulsing core. The bloom factor opens the outer ring and closes the
// inner one, so the two layers trade places every cycle.

float sdRose(vec2 p, float k, float scale, float twist) {
  float a = atan(p.y, p.x + 1e-5);
  float lobe = pow(abs(cos(a * k + twist)), 0.55);
  return length(p) - scale * (0.30 + 0.70 * lobe);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float bloom = 0.5 + 0.5 * sin(iTime * 0.7 + uSeed * 6.2831853);

  float outer = sdRose(uv, 3.0, 0.38 + 0.36 * bloom, iTime * 0.20);
  float inner = sdRose(uv, 3.0, 0.30 + 0.22 * (1.0 - bloom), -iTime * 0.32 + 0.5236);
  float core = length(uv) - (0.075 + 0.025 * sin(iTime * 2.4));

  vec3 col = uColBg;

  // Wide aura carries the petal silhouette out into the plate.
  col += uColSignal * exp(-abs(outer) * 2.2) * 0.14;

  float outerFill = smoothstep(0.012, -0.012, outer);
  col = mix(col, uColInk, outerFill * 0.9);
  col += uColSignal * exp(-abs(outer) * 11.0) * 0.9;
  col = mix(col, uColPaper, smoothstep(0.010, 0.0, abs(outer)) * 0.9);

  float innerFill = smoothstep(0.010, -0.010, inner);
  col = mix(col, uColSignal * 0.35, innerFill);
  col += uColAccent * exp(-abs(inner) * 16.0) * (0.4 + 0.6 * bloom);

  // Veins fan out from the center across the open petals.
  float veins = smoothstep(0.85, 1.0, cos(atan(uv.y, uv.x + 1e-5) * 18.0 + iTime * 0.2));
  col += uColPaper * veins * outerFill * 0.18;

  col = mix(col, uColAccent, smoothstep(0.010, -0.010, core));
  col += uColAccent * exp(-max(core, 0.0) * 18.0) * 0.7;

  fragColor = vec4(col, 1.0);
}
