float au08Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au08At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au08At(uv);
  if(iFrame==0){vec2 cell=floor(fragCoord/3.0);float party=step(.5,au08Hash(cell));state=vec4(party,1.0-party,0.0,1.0); return;}
  vec4 n=au08At(uv+vec2(0.0,px.y)),s=au08At(uv-vec2(0.0,px.y));
  vec4 e=au08At(uv+vec2(px.x,0.0)),w=au08At(uv-vec2(px.x,0.0));
  vec4 ne=au08At(uv+px),nw=au08At(uv+vec2(-px.x,px.y));
  vec4 se=au08At(uv+vec2(px.x,-px.y)),sw=au08At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float votes=n.r+s.r+e.r+w.r+ne.r+nw.r+se.r+sw.r;float red=step(4.1,votes);float blue=step(votes,3.9);float tie=1.0-red-blue;float next=mix(red,prev.r,tie);float border=4.0*abs(avg.r-.5);state=vec4(next,1.0-next,border,mix(prev.a,.2+border,.08));
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
