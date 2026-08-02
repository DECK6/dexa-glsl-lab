float au10Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au10At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au10At(uv);
  if(iFrame==0){vec2 c=floor(fragCoord/5.0);float prey=step(.38,au10Hash(c));float predator=step(.91,au10Hash(c+19.0));state=vec4(prey,predator,0.0,1.0); return;}
  vec4 n=au10At(uv+vec2(0.0,px.y)),s=au10At(uv-vec2(0.0,px.y));
  vec4 e=au10At(uv+vec2(px.x,0.0)),w=au10At(uv-vec2(px.x,0.0));
  vec4 ne=au10At(uv+px),nw=au10At(uv+vec2(-px.x,px.y));
  vec4 se=au10At(uv+vec2(px.x,-px.y)),sw=au10At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float prey=clamp(prev.r+.11*lap.r+.018*prev.r*(1.0-prev.r)-.055*prev.r*prev.g,0.0,1.0);float predator=clamp(prev.g+.08*lap.g+.045*prev.r*prev.g-.022*prev.g,0.0,1.0);float encounter=mix(prev.b,prey*predator,.2);state=vec4(prey,predator,encounter,1.0);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec4 q=texture(iChannel0,uv);
  float grain=0.5+0.5*sin((uv.x*17.0+uv.y*23.0+iTime*0.7)*6.28318);
  vec3 col=mix(uColBg,uColDim,0.12+0.32*q.b);
  col=mix(col,uColSignal,clamp(q.r,0.0,1.0));
  col=mix(col,uColAccent,clamp(q.g,0.0,1.0)*0.72);
  col+=uColPaper*q.a*(0.08+0.08*grain);

  fragColor=vec4(col,1.0);
}
