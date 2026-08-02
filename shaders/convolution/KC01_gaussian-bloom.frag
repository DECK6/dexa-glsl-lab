vec3 gaussianNine(vec2 uv, vec2 texel) {
  vec3 sum = texture(iChannel0, uv).rgb * 4.0;
  sum += texture(iChannel0, uv + vec2(texel.x, 0.0)).rgb * 2.0;
  sum += texture(iChannel0, uv - vec2(texel.x, 0.0)).rgb * 2.0;
  sum += texture(iChannel0, uv + vec2(0.0, texel.y)).rgb * 2.0;
  sum += texture(iChannel0, uv - vec2(0.0, texel.y)).rgb * 2.0;
  sum += texture(iChannel0, uv + texel).rgb;
  sum += texture(iChannel0, uv - texel).rgb;
  sum += texture(iChannel0, uv + vec2(texel.x, -texel.y)).rgb;
  sum += texture(iChannel0, uv + vec2(-texel.x, texel.y)).rgb;
  return sum / 16.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 texel = (1.0 + 4.0 * (0.5 + 0.5 * sin(iTime * 0.7))) / iChannelResolution[0].xy;
  vec3 source = texture(iChannel0, uv).rgb;
  vec3 blur = gaussianNine(uv, texel);
  float energy = dot(max(blur - 0.42, 0.0), vec3(0.299, 0.587, 0.114));
  float edge = length(source - blur);
  vec3 col = mix(uColInk, uColPaper, dot(source, vec3(0.333)));
  col = mix(col, uColSignal, smoothstep(0.04, 0.36, edge));
  col += uColAccent * energy * 0.65;
  col = mix(uColBg, col, smoothstep(0.0, 0.08, edge + energy));
  fragColor = vec4(col, 1.0);
}
