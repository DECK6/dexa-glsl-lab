float au09Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au09At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au09At(uv);
  if(iFrame==0){vec2 c=floor(fragCoord/4.0);float cross=step(abs(c.x-iResolution.x/8.0)+abs(c.y-iResolution.y/8.0),1.0);state=vec4(cross,0.0,0.0,1.0); return;}
  vec4 n=au09At(uv+vec2(0.0,px.y)),s=au09At(uv-vec2(0.0,px.y));
  vec4 e=au09At(uv+vec2(px.x,0.0)),w=au09At(uv-vec2(px.x,0.0));
  vec4 ne=au09At(uv+px),nw=au09At(uv+vec2(-px.x,px.y));
  vec4 se=au09At(uv+vec2(px.x,-px.y)),sw=au09At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float sum=n.r+s.r+e.r+w.r;float parity=mod(floor(sum+.5),2.0);float diagonal=mod(floor(ne.r+nw.r+se.r+sw.r+.5),2.0);state=vec4(parity,mix(prev.g,diagonal,.35),abs(parity-diagonal),1.0);
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
