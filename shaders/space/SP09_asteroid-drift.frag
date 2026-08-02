// Four seeded cell layers drift at different speeds to create belt parallax.
// Rotating irregular silhouettes carry directional light and warm shadow rims.

float sp09Hash(vec2 p) {
  p = fract(p * vec2(203.57, 371.11) + uSeed * 0.613);
  p += dot(p, p + 32.59);
  return fract(p.x * p.y);
}

mat2 sp09Rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
  float t = iTime + 2.0;
  vec2 starGrid = (uv + uSeed * 0.014) * 96.0;
  vec2 starCell = floor(starGrid);
  vec2 starLocal = fract(starGrid) - 0.5;
  float stars = smoothstep(0.983, 0.999, sp09Hash(starCell))
                * exp(-dot(starLocal, starLocal) * 240.0);
  float dust = 0.5 + 0.5 * sin(uv.x * 2.7 + uv.y * 4.1 - t * 0.13);
  vec3 col = mix(uColBg, uColInk, 0.34 + dust * 0.09);
  col += uColPaper * stars * 0.48;

  for (int i = 0; i < 4; i++) {
    float layer = float(3 - i);
    float nearLayer = 1.0 - layer / 3.0;
    float scale = 2.55 + layer * 1.45;
    float direction = mix(-1.0, 1.0, step(0.5, mod(layer, 2.0)));
    float speed = 0.055 + nearLayer * 0.19;
    vec2 p = uv * scale + vec2(t * speed * direction,
                                layer * 9.7 + uSeed * 1.31);
    vec2 cell = floor(p);
    vec2 local = fract(p) - 0.5;
    vec2 offset = vec2(sp09Hash(cell + vec2(7.0, 3.0)),
                       sp09Hash(cell + vec2(19.0, 11.0))) - 0.5;
    vec2 rockP = local - offset * 0.38;
    float random = sp09Hash(cell + vec2(41.0, 23.0));
    float rotation = random * 6.2831853 + t * (0.18 + random * 0.34) * direction;
    rockP = sp09Rotate(rotation) * rockP;

    float rockAngle = atan(rockP.y, rockP.x);
    float distortion = 1.0 + 0.16 * sin(rockAngle * 3.0 + random * 8.0)
                       + 0.09 * sin(rockAngle * 5.0 - random * 13.0);
    float size = 0.14 + random * 0.11 + nearLayer * 0.025;
    float sdf = length(rockP) * distortion - size;
    float pick = smoothstep(0.42, 0.92, sp09Hash(cell + vec2(2.0, 29.0)));
    float rock = (1.0 - smoothstep(-0.015, 0.025, sdf)) * pick;
    float rim = exp(-abs(sdf) * 82.0) * pick;

    vec2 normal = normalize(rockP + vec2(0.001));
    float light = 0.18 + 0.82 * smoothstep(-0.72, 0.72,
                                            dot(normal, normalize(vec2(-0.7, 0.6))));
    vec3 rockCol = mix(uColInk, uColDim, 0.28 + nearLayer * 0.48);
    rockCol = mix(rockCol, uColPaper, light * nearLayer * 0.34);
    rockCol += uColAccent * (1.0 - light) * rim * nearLayer * 0.34;
    float opacity = mix(0.36, 0.96, nearLayer);
    col = mix(col, rockCol, clamp(rock * opacity, 0.0, 1.0));
    col += uColPaper * rim * light * nearLayer * 0.22;
  }

  fragColor = vec4(col, 1.0);
}
