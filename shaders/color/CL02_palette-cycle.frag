// Five palette stops blended by cosine lobes. Each stop owns a phase and the
// phase field is a slow spiral, so the colors roll through one another.

float lobe(float t, float phase) {
  float c = 0.5 + 0.5 * cos(6.2831 * (t - phase));
  return c * c * c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  float r = length(uv);
  float ang = atan(uv.y, uv.x);

  // spiral phase: rings crawl inward while the arm rotates
  float t = r * 1.15 - iTime * 0.13 + ang / 6.2831 + uSeed * 0.37;
  t += 0.09 * sin(ang * 3.0 + iTime * 0.6);

  float w0 = lobe(t, 0.0);
  float w1 = lobe(t, 0.2);
  float w2 = lobe(t, 0.4);
  float w3 = lobe(t, 0.6);
  float w4 = lobe(t, 0.8);
  float sum = w0 + w1 + w2 + w3 + w4 + 0.0001;

  vec3 col = uColBg * w0 + uColSignal * w1 + uColPaper * w2
           + uColAccent * w3 + uColDim * w4;
  col /= sum;

  // the crest between two stops picks up a thin bright seam
  float seam = pow(max(max(w1, w2), w3), 4.0);
  col += uColPaper * seam * 0.14;

  fragColor = vec4(col, 1.0);
}
