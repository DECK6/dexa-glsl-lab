float au03Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au03At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au03At(uv);
  if(iFrame==0){vec2 cell=floor(fragCoord/2.0);float live=step(.88,au03Hash(cell));state=vec4(live,0.0,live,1.0); return;}
  vec4 n=au03At(uv+vec2(0.0,px.y)),s=au03At(uv-vec2(0.0,px.y));
  vec4 e=au03At(uv+vec2(px.x,0.0)),w=au03At(uv-vec2(px.x,0.0));
  vec4 ne=au03At(uv+px),nw=au03At(uv+vec2(-px.x,px.y));
  vec4 se=au03At(uv+vec2(px.x,-px.y)),sw=au03At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float count=n.r+s.r+e.r+w.r+ne.r+nw.r+se.r+sw.r;float born=(1.0-prev.r)*step(1.5,count)*step(count,2.5);state=vec4(born,prev.r,max(born,prev.b*.94),1.0);
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
