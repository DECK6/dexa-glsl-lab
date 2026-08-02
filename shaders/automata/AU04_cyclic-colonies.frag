float au04Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au04At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au04At(uv);
  if(iFrame==0){vec2 cell=floor(fragCoord/4.0);float phase=floor(4.0*au04Hash(cell))/3.0;state=vec4(phase,fract(phase+1.0/3.0),0.0,1.0); return;}
  vec4 n=au04At(uv+vec2(0.0,px.y)),s=au04At(uv-vec2(0.0,px.y));
  vec4 e=au04At(uv+vec2(px.x,0.0)),w=au04At(uv-vec2(px.x,0.0));
  vec4 ne=au04At(uv+px),nw=au04At(uv+vec2(-px.x,px.y));
  vec4 se=au04At(uv+vec2(px.x,-px.y)),sw=au04At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float level=floor(prev.r*3.99);float target=mod(level+1.0,4.0)/3.0;float hits=step(abs(n.r-target),.08)+step(abs(s.r-target),.08)+step(abs(e.r-target),.08)+step(abs(w.r-target),.08);float advance=step(1.5,hits);float value=mix(prev.r,target,advance);state=vec4(value,fract(value+.333),advance,1.0);
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
